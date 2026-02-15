import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { runMigrations } from "stripe-replit-sync";
import { getStripeSync } from "./stripeClient";
import { WebhookHandlers } from "./webhookHandlers";
import { storage } from "./storage";

const app = express();
app.set("trust proxy", 1);
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(helmet({ contentSecurityPolicy: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse).substring(0, 200)}`;
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  try {
    const adminUser = await storage.getUserByEmail("admin@hubhub.co");
    if (adminUser && !adminUser.isAdmin) {
      const { db } = await import("./db");
      const { users } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      await db.update(users).set({ isAdmin: true }).where(eq(users.id, adminUser.id));
      log("Set admin flag for admin@hubhub.co", "auth");
    }
  } catch (err: any) {
    log(`Admin setup note: ${err.message}`, "auth");
  }

  try {
    const stripeSync = await getStripeSync();
    await runMigrations(stripeSync);

    const webhookPath = '/api/stripe/webhook';
    const domains = process.env.REPLIT_DOMAINS?.split(',') || [];
    const webhookUrl = domains.length > 0 ? `https://${domains[0]}${webhookPath}` : null;

    if (webhookUrl && typeof stripeSync.registerWebhook === 'function') {
      await stripeSync.registerWebhook(webhookUrl);
    }

    app.post(webhookPath, async (req: Request, res: Response) => {
      try {
        await WebhookHandlers.processWebhook(req.rawBody as Buffer, req.headers['stripe-signature'] as string);
        res.json({ received: true });
      } catch (err: any) {
        log(`Webhook error: ${err.message}`, 'stripe');
        res.status(400).json({ error: err.message });
      }
    });

    log("Stripe billing enabled", "stripe");
  } catch (err: any) {
    log(`Stripe setup skipped: ${err.message}`, "stripe");
  }

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (res.headersSent) return next(err);
    return res.status(status).json({ message });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
    log(`serving on port ${port}`);
  });
})();

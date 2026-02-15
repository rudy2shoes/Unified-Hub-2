import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertConnectedAppSchema, insertAppCategorySchema, insertClientWorkspaceSchema } from "@shared/schema";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import rateLimit from "express-rate-limit";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";

const PgStore = connectPgSimple(session);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later" },
});

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

function csrfProtection(req: Request, res: Response, next: Function) {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return next();
  }
  const origin = req.get("origin");
  const host = req.get("host");
  if (origin) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return res.status(403).json({ message: "Forbidden" });
      }
    } catch {
      return res.status(403).json({ message: "Forbidden" });
    }
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use(
    session({
      store: new PgStore({ conString: process.env.DATABASE_URL, createTableIfMissing: true }),
      secret: (() => {
        const secret = process.env.SESSION_SECRET;
        if (!secret) {
          if (process.env.NODE_ENV === "production") {
            throw new Error("SESSION_SECRET environment variable is required in production");
          }
          return "hub-dev-only-secret-not-for-production";
        }
        return secret;
      })(),
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === 'production', sameSite: 'lax', httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 },
    })
  );

  app.use("/api", csrfProtection);

  app.post("/api/auth/signup", authLimiter, async (req, res) => {
    try {
      const parsed = insertUserSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });

      const existing = await storage.getUserByEmail(parsed.data.email);
      if (existing) return res.status(409).json({ message: "Email already registered" });

      const user = await storage.createUser(parsed.data);
      req.session.userId = user.id;
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
      const { password, ...safeUser } = user;
      req.session.save((err) => {
        if (err) return res.status(500).json({ message: "Session save failed" });
        res.status(201).json(safeUser);
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/auth/login", authLimiter, async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });

      const user = await storage.getUserByEmail(parsed.data.email);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });

      const valid = await storage.verifyPassword(parsed.data.password, user.password);
      if (!valid) return res.status(401).json({ message: "Invalid credentials" });

      req.session.userId = user.id;

      if (req.body.rememberMe) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
      } else {
        req.session.cookie.maxAge = 24 * 60 * 60 * 1000;
      }

      const { password, ...safeUser } = user;
      req.session.save((err) => {
        if (err) return res.status(500).json({ message: "Session save failed" });
        res.json(safeUser);
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => res.json({ ok: true }));
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Not authenticated" });
    const user = await storage.getUser(req.session.userId);
    if (!user) return res.status(401).json({ message: "User not found" });
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });

  app.post("/api/checkout", requireAuth, async (req, res) => {
    try {
      const stripe = await getUncachableStripeClient();
      const user = await storage.getUser(req.session.userId!);
      if (!user) return res.status(401).json({ message: "User not found" });

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        });
        customerId = customer.id;
        await storage.updateUserStripeInfo(user.id, { stripeCustomerId: customerId });
      }

      const prices = await stripe.prices.list({ active: true, limit: 10 });
      const proPrice = prices.data.find(p => p.recurring?.interval === "month");
      if (!proPrice) return res.status(400).json({ message: "No active price found" });

      const domains = process.env.REPLIT_DOMAINS?.split(",") || [];
      const baseUrl = domains.length > 0 ? `https://${domains[0]}` : "http://localhost:5000";

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [{ price: proPrice.id, quantity: 1 }],
        mode: "subscription",
        subscription_data: { trial_period_days: 7 },
        success_url: `${baseUrl}/dashboard?checkout=success`,
        cancel_url: `${baseUrl}/dashboard?checkout=cancel`,
      });

      res.json({ url: session.url });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/stripe/publishable-key", async (_req, res) => {
    try {
      const key = await getStripePublishableKey();
      res.json({ publishableKey: key });
    } catch {
      res.json({ publishableKey: null });
    }
  });

  app.get("/api/subscription", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) return res.status(401).json({ message: "User not found" });

      if (user.stripeSubscriptionId) {
        const stripe = await getUncachableStripeClient();
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        res.json({ subscription, freeAccess: false });
      } else {
        res.json({ subscription: null, freeAccess: true });
      }
    } catch (err: any) {
      res.json({ subscription: null, freeAccess: true });
    }
  });

  app.get("/api/apps", requireAuth, async (req, res) => {
    const apps = await storage.getConnectedApps(req.session.userId!);
    res.json(apps);
  });

  app.post("/api/apps", requireAuth, async (req, res) => {
    try {
      const parsed = insertConnectedAppSchema.safeParse({ ...req.body, userId: req.session.userId });
      if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });
      const app = await storage.addConnectedApp(parsed.data);
      res.status(201).json(app);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.patch("/api/apps/:id", requireAuth, async (req, res) => {
    const data: Record<string, any> = {};
    if (typeof req.body.name === "string") data.name = req.body.name;
    if (typeof req.body.category === "string") data.category = req.body.category;
    if (typeof req.body.color === "string") data.color = req.body.color;
    if (typeof req.body.url === "string") data.url = req.body.url;
    if (typeof req.body.isFavorite === "boolean") data.isFavorite = req.body.isFavorite;
    if (typeof req.body.sortOrder === "number") data.sortOrder = req.body.sortOrder;
    if (typeof req.body.notificationCount === "number") data.notificationCount = Math.max(0, Math.min(99, Math.floor(req.body.notificationCount)));
    const updated = await storage.updateConnectedApp(req.params.id, req.session.userId!, data);
    if (!updated) return res.status(404).json({ message: "App not found" });
    res.json(updated);
  });

  app.delete("/api/apps/:id", requireAuth, async (req, res) => {
    await storage.removeConnectedApp(req.params.id, req.session.userId!);
    res.json({ ok: true });
  });

  app.get("/api/widgets", requireAuth, async (req, res) => {
    const widgets = await storage.getDashboardWidgets(req.session.userId!);
    res.json(widgets);
  });

  app.put("/api/widgets", requireAuth, async (req, res) => {
    try {
      const widgets = req.body;
      if (!Array.isArray(widgets)) return res.status(400).json({ message: "Expected array of widgets" });
      if (widgets.length > 20) return res.status(400).json({ message: "Too many widgets" });
      for (const w of widgets) {
        if (!w.widgetType || typeof w.widgetType !== "string") return res.status(400).json({ message: "Invalid widget type" });
        if (!w.title || typeof w.title !== "string") return res.status(400).json({ message: "Invalid widget title" });
      }
      const saved = await storage.saveDashboardWidgets(req.session.userId!, widgets);
      res.json(saved);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/categories", requireAuth, async (req, res) => {
    const categories = await storage.getCategories(req.session.userId!);
    res.json(categories);
  });

  app.post("/api/categories", requireAuth, async (req, res) => {
    try {
      const parsed = insertAppCategorySchema.safeParse({ ...req.body, userId: req.session.userId });
      if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });
      const category = await storage.addCategory(parsed.data);
      res.status(201).json(category);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.patch("/api/categories/:id", requireAuth, async (req, res) => {
    const updated = await storage.updateCategory(req.params.id, req.session.userId!, req.body);
    if (!updated) return res.status(404).json({ message: "Category not found" });
    res.json(updated);
  });

  app.delete("/api/categories/:id", requireAuth, async (req, res) => {
    await storage.removeCategory(req.params.id, req.session.userId!);
    res.json({ ok: true });
  });

  app.get("/api/workspaces", requireAuth, async (req, res) => {
    const workspaces = await storage.getClientWorkspaces(req.session.userId!);
    res.json(workspaces);
  });

  app.put("/api/workspaces/reorder", requireAuth, async (req, res) => {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) return res.status(400).json({ message: "orderedIds must be an array" });
      await storage.reorderClientWorkspaces(req.session.userId!, orderedIds);
      res.json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/workspaces", requireAuth, async (req, res) => {
    try {
      const parsed = insertClientWorkspaceSchema.safeParse({ ...req.body, userId: req.session.userId });
      if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });
      const workspace = await storage.createClientWorkspace(parsed.data);
      res.status(201).json(workspace);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.patch("/api/workspaces/:id", requireAuth, async (req, res) => {
    const { name, color, icon } = req.body;
    const data: Record<string, string> = {};
    if (typeof name === "string" && name.trim()) data.name = name.trim();
    if (typeof color === "string") data.color = color;
    if (typeof icon === "string") data.icon = icon;
    const updated = await storage.updateClientWorkspace(req.params.id, req.session.userId!, data);
    if (!updated) return res.status(404).json({ message: "Workspace not found" });
    res.json(updated);
  });

  app.delete("/api/workspaces/:id", requireAuth, async (req, res) => {
    await storage.deleteClientWorkspace(req.params.id, req.session.userId!);
    res.json({ ok: true });
  });

  app.get("/api/workspaces/:id/apps", requireAuth, async (req, res) => {
    const apps = await storage.getWorkspaceApps(req.params.id, req.session.userId!);
    res.json(apps);
  });

  app.put("/api/workspaces/:id/apps", requireAuth, async (req, res) => {
    try {
      const { appIds, catalogApps } = req.body;
      if (!Array.isArray(appIds)) return res.status(400).json({ message: "appIds must be an array" });
      const userApps = await storage.getConnectedApps(req.session.userId!);
      const userAppsByName = new Map(userApps.map(a => [a.name.toLowerCase(), a]));
      const userAppIds = new Set(userApps.map(a => a.id));

      const finalAppIds = new Set(appIds.filter((id: string) => userAppIds.has(id)));

      if (Array.isArray(catalogApps) && catalogApps.length <= 20) {
        const seen = new Set<string>();
        for (const catApp of catalogApps) {
          if (!catApp.name || typeof catApp.name !== "string") continue;
          const nameKey = catApp.name.toLowerCase();
          if (seen.has(nameKey)) continue;
          seen.add(nameKey);
          const existing = userAppsByName.get(nameKey);
          if (existing) {
            finalAppIds.add(existing.id);
          } else {
            const parsed = insertConnectedAppSchema.safeParse({
              userId: req.session.userId,
              name: catApp.name,
              category: String(catApp.category || "Other").slice(0, 50),
              color: String(catApp.color || "#6366F1").slice(0, 10),
              url: String(catApp.url || "").slice(0, 500),
              isFavorite: false,
            });
            if (parsed.success) {
              const newApp = await storage.addConnectedApp(parsed.data);
              finalAppIds.add(newApp.id);
              userAppsByName.set(nameKey, newApp);
            }
          }
        }
      }

      const result = await storage.setWorkspaceApps(req.params.id, req.session.userId!, Array.from(finalAppIds));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  async function requireAdmin(req: Request, res: Response, next: Function) {
    if (!req.session.userId) return res.status(401).json({ message: "Not authenticated" });
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.isAdmin) return res.status(403).json({ message: "Forbidden" });
    next();
  }

  app.get("/api/admin/users", requireAdmin, async (_req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const count = await storage.getUserCount();
      const activeCount = allUsers.filter(u => u.subscriptionStatus === "active" || u.subscriptionStatus === "trialing").length;
      res.json({ users: allUsers, totalCount: count, activeSubscriptions: activeCount });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/stats", requireAdmin, async (_req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const total = allUsers.length;
      const active = allUsers.filter(u => u.subscriptionStatus === "active").length;
      const trialing = allUsers.filter(u => u.subscriptionStatus === "trialing").length;
      const inactive = allUsers.filter(u => u.subscriptionStatus === "inactive" || !u.subscriptionStatus).length;
      const canceled = allUsers.filter(u => u.subscriptionStatus === "canceled").length;

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const newLast30 = allUsers.filter(u => u.createdAt && new Date(u.createdAt) >= thirtyDaysAgo).length;
      const newLast7 = allUsers.filter(u => u.createdAt && new Date(u.createdAt) >= sevenDaysAgo).length;

      res.json({ total, active, trialing, inactive, canceled, newLast30, newLast7 });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const targetUser = await storage.getUser(req.params.id);
      if (!targetUser) return res.status(404).json({ message: "User not found" });
      if (targetUser.isAdmin) return res.status(400).json({ message: "Cannot delete admin users" });
      await storage.deleteUser(req.params.id);
      res.json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  return httpServer;
}

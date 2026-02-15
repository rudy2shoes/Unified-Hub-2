# HUB | Unified Workspace

## Overview

HUB is a unified workspace dashboard application that lets users connect and manage multiple third-party services (GoHighLevel, QuickBooks, banks, etc.) from a single login. It features user authentication, a subscription billing system via Stripe, and a connected apps management interface. The web app opens connected apps in popup windows for full login persistence. A companion Electron desktop app (in `electron/`) uses webview tags for fully embedded app browsing with persistent sessions. The app follows a monorepo structure with a React frontend, Express backend, and PostgreSQL database.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **Dashboard Widgets**: Replaced static dashboard with customizable, drag-and-drop widget grid (Quick Launch, Apps Overview, Favorites, Recent Activity, Plan Status, Clock widgets). Users can add/remove/reorder widgets via "Customize" mode. Widget layouts saved per user in database.
- **App Launch**: Web app opens connected apps in new browser tabs (with noopener/noreferrer security). Toast notification confirms launch with desktop app download hint. "Opens in new tab" hover label on grid icons.
- **App Catalog**: Expanded to 267 pre-loaded apps across 20+ categories (CRM, Finance, Payments, Banking, Email, Marketing, Communication, Productivity, Analytics, E-Commerce, CMS, Support, Design, Developer, Cloud Storage, Documents, HR, Automation, AI, Social Media, Security, Media, Education, Logistics).
- **Electron Desktop App**: Added `electron/` directory with Electron wrapper using BrowserView and persistent session partitions for fully embedded app experience on Mac/Windows/Linux.
- **Remember Me**: Added "Remember me" checkbox to login page. Checked = 30-day session, unchecked = 24-hour session.
- **Production Hardening**: Added helmet security headers, rate limiting on auth routes (20 req/15min), secure cookies in production, log truncation.
- **Branding**: Dark theme with red accent (#EF4444), "hub." logo with red dot. Ultra-dark backgrounds (#0d0d0d, #080808).
- **Agency Mode**: New "Agency" view toggle alongside Apps and Focus. Create client workspaces with custom names/colors, assign apps to each workspace, and launch apps in isolated contexts. Database tables: `client_workspaces`, `client_workspace_apps`. Full ownership-scoped access control on all workspace endpoints. Manage Apps view has search bar and category grouping (Finance, CRM, etc.) matching main dashboard style. Drag-and-drop reordering of workspace cards.
- **Notification Badges**: App icons show red notification badges (count or dot) on the top-right corner. Users can right-click any app icon in the main Apps grid to set/clear badge counts (1, 3, 5, 10, or clear). Badges display across all views (sidebar, Focus favorites, Agency workspace dashboards). Data stored in `notificationCount` column on `connected_apps` table. PATCH /api/apps/:id sanitizes and caps badge count at 99.

## System Architecture

### Monorepo Structure

The project is organized into four main directories:
- **`client/`** — React frontend (Vite-powered SPA)
- **`server/`** — Express backend API
- **`shared/`** — Shared types and database schema used by both client and server
- **`electron/`** — Electron desktop app wrapper (separate package.json, builds independently)

### Frontend Architecture

- **Framework**: React with TypeScript
- **Bundler**: Vite (dev server on port 5000, HMR via custom setup in `server/vite.ts`)
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: TanStack React Query for server state; no global client state library
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives with Tailwind CSS
- **Styling**: Tailwind CSS v4 with CSS variables for theming, dark theme by default, custom fonts (Inter + Outfit)
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Drag & Drop**: @dnd-kit for widget reordering on dashboard
- **Key Pages**: Landing page (`/`), Login (`/login`), Onboarding flow (`/onboarding`), Dashboard (`/dashboard`)
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend Architecture

- **Framework**: Express 5 running on Node.js with TypeScript (via tsx)
- **API Pattern**: RESTful JSON API under `/api/` prefix
- **Authentication**: Session-based auth using `express-session` with `connect-pg-simple` for PostgreSQL session storage. "Remember me" extends session to 30 days.
- **Security**: helmet for HTTP headers, express-rate-limit on auth routes (20 req/15min), secure cookies in production, httpOnly cookies
- **Password Hashing**: Custom scrypt-based hashing (no bcrypt dependency)
- **Dev/Prod Serving**: In development, Vite middleware serves the frontend with HMR. In production, the built static files are served from `dist/public/`.
- **Build Process**: Custom build script (`script/build.ts`) uses Vite for client and esbuild for server, outputting to `dist/`. Server bundle uses CJS format for production.

### Database

- **Database**: PostgreSQL (required, connection via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema validation
- **Schema Location**: `shared/schema.ts`
- **Migrations**: Drizzle Kit with push-based migrations (`npm run db:push`)
- **Tables**:
  - `users` — User accounts with email/password auth, Stripe billing fields (stripeCustomerId, stripeSubscriptionId, subscriptionStatus)
  - `connected_apps` — User's connected third-party applications with name, category, color, URL, favorite status, and sort order
  - `dashboard_widgets` — Per-user widget layout configuration (widgetType, position x/y, size w/h, visibility)
- **Session Storage**: `connect-pg-simple` creates its own session table automatically

### Stripe Integration

- **Billing**: Stripe for subscription payments (HUB Pro plan at $25/month with 7-day free trial)
- **Integration Method**: Uses `stripe-replit-sync` package for webhook management and schema migrations. Stripe credentials are fetched via Replit's connector system (not raw env vars).
- **Webhook Handling**: Stripe webhooks are processed through `WebhookHandlers` class, webhook endpoint auto-registered at `/api/stripe/webhook`
- **Product Seeding**: `server/seed-products.ts` script creates the HUB Pro product and pricing in Stripe

### Dashboard Widgets

- **Widget Types**: quick_launch, apps_overview, favorites, recent_activity, plan_status, clock
- **Components**: Located in `client/src/components/widgets/`
- **Grid**: Uses @dnd-kit for drag-and-drop reordering
- **Persistence**: Widget layouts saved per user via `PUT /api/widgets`
- **Customization**: Users toggle edit mode to add/remove/reorder widgets

### Electron Desktop App

- **Location**: `electron/` directory with separate `package.json`
- **Purpose**: Provides fully embedded app experience using BrowserView with persistent session partitions
- **Key Feature**: Each connected app gets its own BrowserView with `persist:app-{id}` session, so logins survive across app restarts
- **Build Targets**: Mac (.dmg), Windows (NSIS installer), Linux (AppImage)
- **Setup**: `cd electron && npm install && npm start`

### API Routes

All routes are prefixed with `/api/`:
- `POST /api/auth/signup` — Create account (rate limited)
- `POST /api/auth/login` — Login with optional rememberMe flag (rate limited)
- `POST /api/auth/logout` — Logout
- `GET /api/auth/me` — Get current user
- `GET /api/apps` — List connected apps
- `POST /api/apps` — Add connected app
- `DELETE /api/apps/:id` — Remove connected app
- `PATCH /api/apps/:id` — Update connected app
- `GET /api/widgets` — Get user's dashboard widget layout
- `PUT /api/widgets` — Save user's dashboard widget layout
- Stripe-related routes for checkout and webhooks

### Key Design Decisions

1. **Session-based auth over JWT**: Simpler to implement, sessions stored in PostgreSQL for persistence across restarts.
2. **Popup windows over iframes for web**: Modern browsers block third-party cookies in iframes, preventing login persistence. Popup windows work as first-party contexts.
3. **Electron for embedded experience**: Desktop app uses BrowserView with persistent session partitions, giving each app its own isolated cookie jar that survives restarts.
4. **Shared schema between client and server**: The `shared/` directory contains Drizzle schema and Zod validators used by both sides, ensuring type safety across the stack.
5. **No separate migration files for app schema**: Uses `drizzle-kit push` for direct schema synchronization (migrations directory exists but is primarily for Stripe schema).
6. **Custom build pipeline**: Uses esbuild to bundle server dependencies (listed in allowlist) to reduce cold start times on deployment.

## External Dependencies

### Required Services
- **PostgreSQL Database**: Required. Connected via `DATABASE_URL` environment variable. Used for user data, connected apps, widget layouts, and session storage.
- **Stripe**: Payment processing for subscriptions. Credentials obtained via Replit's connector system. Manages webhook registration automatically.

### Key NPM Packages
- **drizzle-orm** + **drizzle-kit**: Database ORM and migration tooling
- **express-session** + **connect-pg-simple**: Server-side session management
- **helmet**: HTTP security headers
- **express-rate-limit**: Auth endpoint rate limiting
- **stripe** + **stripe-replit-sync**: Payment processing and webhook sync
- **@tanstack/react-query**: Client-side data fetching and caching
- **@dnd-kit/core** + **@dnd-kit/sortable**: Drag-and-drop widget reordering
- **wouter**: Client-side routing
- **framer-motion**: Animations
- **shadcn/ui** (Radix UI + Tailwind): Component library
- **zod** + **drizzle-zod**: Runtime validation

### Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (required)
- `SESSION_SECRET` — Session encryption secret (has fallback default for dev)
- `REPLIT_DOMAINS` — Used for Stripe webhook URL configuration
- Stripe credentials are fetched dynamically via Replit connectors, not through direct env vars

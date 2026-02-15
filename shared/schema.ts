import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  isAdmin: boolean("is_admin").default(false),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status").default("inactive"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const connectedApps = pgTable("connected_apps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  category: text("category").notNull(),
  color: text("color").default("#6366F1"),
  url: text("url"),
  isFavorite: boolean("is_favorite").default(false),
  notificationCount: integer("notification_count").default(0),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const appCategories = pgTable("app_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  icon: text("icon").notNull().default("Folder"),
  color: text("color").default("#6366F1"),
  sortOrder: integer("sort_order").default(0),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isAdmin: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
  subscriptionStatus: true,
  createdAt: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const dashboardWidgets = pgTable("dashboard_widgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  widgetType: text("widget_type").notNull(),
  title: text("title").notNull(),
  x: integer("x").notNull().default(0),
  y: integer("y").notNull().default(0),
  w: integer("w").notNull().default(1),
  h: integer("h").notNull().default(1),
  visible: boolean("visible").default(true),
});

export const insertConnectedAppSchema = createInsertSchema(connectedApps).omit({
  id: true,
  createdAt: true,
});

export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ConnectedApp = typeof connectedApps.$inferSelect;
export type InsertConnectedApp = z.infer<typeof insertConnectedAppSchema>;
export type DashboardWidget = typeof dashboardWidgets.$inferSelect;
export type InsertDashboardWidget = z.infer<typeof insertDashboardWidgetSchema>;

export const insertAppCategorySchema = createInsertSchema(appCategories).omit({ id: true });
export type AppCategory = typeof appCategories.$inferSelect;
export type InsertAppCategory = z.infer<typeof insertAppCategorySchema>;

export const clientWorkspaces = pgTable("client_workspaces", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  color: text("color").default("#6366F1"),
  icon: text("icon").default("Building2"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clientWorkspaceApps = pgTable("client_workspace_apps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: varchar("workspace_id").notNull().references(() => clientWorkspaces.id, { onDelete: "cascade" }),
  appId: varchar("app_id").notNull().references(() => connectedApps.id, { onDelete: "cascade" }),
});

export const insertClientWorkspaceSchema = createInsertSchema(clientWorkspaces).omit({ id: true, createdAt: true });
export type ClientWorkspace = typeof clientWorkspaces.$inferSelect;
export type InsertClientWorkspace = z.infer<typeof insertClientWorkspaceSchema>;

export const insertClientWorkspaceAppSchema = createInsertSchema(clientWorkspaceApps).omit({ id: true });
export type ClientWorkspaceApp = typeof clientWorkspaceApps.$inferSelect;
export type InsertClientWorkspaceApp = z.infer<typeof insertClientWorkspaceAppSchema>;

import { users, connectedApps, dashboardWidgets, appCategories, clientWorkspaces, clientWorkspaceApps, type User, type InsertUser, type ConnectedApp, type InsertConnectedApp, type DashboardWidget, type InsertDashboardWidget, type AppCategory, type InsertAppCategory, type ClientWorkspace, type InsertClientWorkspace, type ClientWorkspaceApp } from "@shared/schema";
import { eq, and, asc, sql } from "drizzle-orm";
import { db } from "./db";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashedPassword, salt] = stored.split(".");
  const buf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(buf, Buffer.from(hashedPassword, "hex"));
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyPassword(supplied: string, stored: string): Promise<boolean>;
  updateUserStripeInfo(userId: string, info: { stripeCustomerId?: string; stripeSubscriptionId?: string; subscriptionStatus?: string }): Promise<User | undefined>;

  getConnectedApps(userId: string): Promise<ConnectedApp[]>;
  addConnectedApp(app: InsertConnectedApp): Promise<ConnectedApp>;
  removeConnectedApp(id: string, userId: string): Promise<void>;
  updateConnectedApp(id: string, userId: string, data: Partial<InsertConnectedApp>): Promise<ConnectedApp | undefined>;

  getCategories(userId: string): Promise<AppCategory[]>;
  addCategory(category: InsertAppCategory): Promise<AppCategory>;
  updateCategory(id: string, userId: string, data: Partial<InsertAppCategory>): Promise<AppCategory | undefined>;
  removeCategory(id: string, userId: string): Promise<void>;

  getDashboardWidgets(userId: string): Promise<DashboardWidget[]>;
  saveDashboardWidgets(userId: string, widgets: InsertDashboardWidget[]): Promise<DashboardWidget[]>;

  getClientWorkspaces(userId: string): Promise<ClientWorkspace[]>;
  reorderClientWorkspaces(userId: string, orderedIds: string[]): Promise<void>;
  createClientWorkspace(workspace: InsertClientWorkspace): Promise<ClientWorkspace>;
  updateClientWorkspace(id: string, userId: string, data: Partial<InsertClientWorkspace>): Promise<ClientWorkspace | undefined>;
  deleteClientWorkspace(id: string, userId: string): Promise<void>;
  getWorkspaceApps(workspaceId: string, userId: string): Promise<ClientWorkspaceApp[]>;
  setWorkspaceApps(workspaceId: string, userId: string, appIds: string[]): Promise<ClientWorkspaceApp[]>;

  getAllUsers(): Promise<Omit<User, 'password'>[]>;
  getUserCount(): Promise<number>;
  deleteUser(id: string): Promise<void>;

  getProduct(productId: string): Promise<any>;
  getSubscription(subscriptionId: string): Promise<any>;
  listProducts(): Promise<any[]>;
  listPrices(): Promise<any[]>;
}

class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await hashPassword(insertUser.password);
    const [user] = await db.insert(users).values({ ...insertUser, password: hashedPassword }).returning();
    return user;
  }

  async verifyPassword(supplied: string, stored: string): Promise<boolean> {
    return comparePasswords(supplied, stored);
  }

  async updateUserStripeInfo(userId: string, info: { stripeCustomerId?: string; stripeSubscriptionId?: string; subscriptionStatus?: string }): Promise<User | undefined> {
    const [user] = await db.update(users).set(info).where(eq(users.id, userId)).returning();
    return user;
  }

  async getConnectedApps(userId: string): Promise<ConnectedApp[]> {
    return db.select().from(connectedApps).where(eq(connectedApps.userId, userId)).orderBy(asc(connectedApps.sortOrder));
  }

  async addConnectedApp(app: InsertConnectedApp): Promise<ConnectedApp> {
    const [result] = await db.insert(connectedApps).values(app).returning();
    return result;
  }

  async removeConnectedApp(id: string, userId: string): Promise<void> {
    await db.delete(connectedApps).where(and(eq(connectedApps.id, id), eq(connectedApps.userId, userId)));
  }

  async updateConnectedApp(id: string, userId: string, data: Partial<InsertConnectedApp>): Promise<ConnectedApp | undefined> {
    const [result] = await db.update(connectedApps).set(data).where(and(eq(connectedApps.id, id), eq(connectedApps.userId, userId))).returning();
    return result;
  }

  async getCategories(userId: string): Promise<AppCategory[]> {
    return db.select().from(appCategories).where(eq(appCategories.userId, userId)).orderBy(asc(appCategories.sortOrder));
  }

  async addCategory(category: InsertAppCategory): Promise<AppCategory> {
    const [result] = await db.insert(appCategories).values(category).returning();
    return result;
  }

  async updateCategory(id: string, userId: string, data: Partial<InsertAppCategory>): Promise<AppCategory | undefined> {
    const [result] = await db.update(appCategories).set(data).where(and(eq(appCategories.id, id), eq(appCategories.userId, userId))).returning();
    return result;
  }

  async removeCategory(id: string, userId: string): Promise<void> {
    await db.delete(appCategories).where(and(eq(appCategories.id, id), eq(appCategories.userId, userId)));
  }

  async getDashboardWidgets(userId: string): Promise<DashboardWidget[]> {
    return db.select().from(dashboardWidgets).where(eq(dashboardWidgets.userId, userId));
  }

  async saveDashboardWidgets(userId: string, widgets: InsertDashboardWidget[]): Promise<DashboardWidget[]> {
    await db.delete(dashboardWidgets).where(eq(dashboardWidgets.userId, userId));
    if (widgets.length === 0) return [];
    const toInsert = widgets.map(w => ({ ...w, userId }));
    return db.insert(dashboardWidgets).values(toInsert).returning();
  }

  async getClientWorkspaces(userId: string): Promise<ClientWorkspace[]> {
    return db.select().from(clientWorkspaces).where(eq(clientWorkspaces.userId, userId)).orderBy(asc(clientWorkspaces.sortOrder), asc(clientWorkspaces.createdAt));
  }

  async reorderClientWorkspaces(userId: string, orderedIds: string[]): Promise<void> {
    for (let i = 0; i < orderedIds.length; i++) {
      await db.update(clientWorkspaces).set({ sortOrder: i }).where(and(eq(clientWorkspaces.id, orderedIds[i]), eq(clientWorkspaces.userId, userId)));
    }
  }

  async createClientWorkspace(workspace: InsertClientWorkspace): Promise<ClientWorkspace> {
    const [result] = await db.insert(clientWorkspaces).values(workspace).returning();
    return result;
  }

  async updateClientWorkspace(id: string, userId: string, data: Partial<InsertClientWorkspace>): Promise<ClientWorkspace | undefined> {
    const [result] = await db.update(clientWorkspaces).set(data).where(and(eq(clientWorkspaces.id, id), eq(clientWorkspaces.userId, userId))).returning();
    return result;
  }

  async deleteClientWorkspace(id: string, userId: string): Promise<void> {
    await db.delete(clientWorkspaces).where(and(eq(clientWorkspaces.id, id), eq(clientWorkspaces.userId, userId)));
  }

  async getWorkspaceApps(workspaceId: string, userId: string): Promise<ClientWorkspaceApp[]> {
    const [workspace] = await db.select().from(clientWorkspaces).where(and(eq(clientWorkspaces.id, workspaceId), eq(clientWorkspaces.userId, userId)));
    if (!workspace) return [];
    return db.select().from(clientWorkspaceApps).where(eq(clientWorkspaceApps.workspaceId, workspaceId));
  }

  async setWorkspaceApps(workspaceId: string, userId: string, appIds: string[]): Promise<ClientWorkspaceApp[]> {
    const [workspace] = await db.select().from(clientWorkspaces).where(and(eq(clientWorkspaces.id, workspaceId), eq(clientWorkspaces.userId, userId)));
    if (!workspace) return [];
    await db.delete(clientWorkspaceApps).where(eq(clientWorkspaceApps.workspaceId, workspaceId));
    if (appIds.length === 0) return [];
    const values = appIds.map(appId => ({ workspaceId, appId }));
    return db.insert(clientWorkspaceApps).values(values).returning();
  }

  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    const allUsers = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      isAdmin: users.isAdmin,
      stripeCustomerId: users.stripeCustomerId,
      stripeSubscriptionId: users.stripeSubscriptionId,
      subscriptionStatus: users.subscriptionStatus,
      createdAt: users.createdAt,
    }).from(users).orderBy(asc(users.createdAt));
    return allUsers;
  }

  async getUserCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(users);
    return Number(result[0].count);
  }

  async deleteUser(id: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(connectedApps).where(eq(connectedApps.userId, id));
      await tx.delete(dashboardWidgets).where(eq(dashboardWidgets.userId, id));
      await tx.delete(appCategories).where(eq(appCategories.userId, id));
      const workspaces = await tx.select().from(clientWorkspaces).where(eq(clientWorkspaces.userId, id));
      for (const ws of workspaces) {
        await tx.delete(clientWorkspaceApps).where(eq(clientWorkspaceApps.workspaceId, ws.id));
      }
      await tx.delete(clientWorkspaces).where(eq(clientWorkspaces.userId, id));
      await tx.delete(users).where(eq(users.id, id));
    });
  }

  async getProduct(_productId: string): Promise<any> {
    return null;
  }

  async listProducts(): Promise<any[]> {
    return [];
  }

  async getSubscription(_subscriptionId: string): Promise<any> {
    return null;
  }

  async listPrices(): Promise<any[]> {
    return [];
  }
}

export const storage = new DatabaseStorage();

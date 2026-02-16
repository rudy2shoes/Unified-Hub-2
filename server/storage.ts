import { users, connectedApps, dashboardWidgets, appCategories, clientWorkspaces, clientWorkspaceApps, chatConversations, chatMessages, type User, type InsertUser, type ConnectedApp, type InsertConnectedApp, type DashboardWidget, type InsertDashboardWidget, type AppCategory, type InsertAppCategory, type ClientWorkspace, type InsertClientWorkspace, type ClientWorkspaceApp, type ChatConversation, type ChatMessage } from "@shared/schema";
import { eq, and, asc, desc, sql } from "drizzle-orm";
import { db } from "./db";
import { scrypt, randomBytes, timingSafeEqual, createCipheriv, createDecipheriv } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

const ENCRYPTION_KEY = process.env.SESSION_SECRET || "hub-dev-only-secret-not-for-production";

function encryptApiKey(plaintext: string): string {
  const key = Buffer.alloc(32);
  const keySource = Buffer.from(ENCRYPTION_KEY);
  keySource.copy(key, 0, 0, Math.min(keySource.length, 32));
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decryptApiKey(ciphertext: string): string {
  const key = Buffer.alloc(32);
  const keySource = Buffer.from(ENCRYPTION_KEY);
  keySource.copy(key, 0, 0, Math.min(keySource.length, 32));
  const [ivHex, encrypted] = ciphertext.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

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

  updateAiSettings(userId: string, provider: string, apiKey: string): Promise<void>;
  getAiSettings(userId: string): Promise<{ provider: string | null; hasKey: boolean }>;
  getAiApiKey(userId: string): Promise<{ provider: string | null; apiKey: string | null }>;
  clearAiSettings(userId: string): Promise<void>;

  getChatConversations(userId: string): Promise<ChatConversation[]>;
  createChatConversation(userId: string, title: string): Promise<ChatConversation>;
  updateChatConversationTitle(id: string, userId: string, title: string): Promise<ChatConversation | undefined>;
  deleteChatConversation(id: string, userId: string): Promise<void>;
  getChatMessages(conversationId: string, userId: string): Promise<ChatMessage[]>;
  addChatMessage(conversationId: string, userId: string, role: string, content: string): Promise<ChatMessage>;
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

  async updateAiSettings(userId: string, provider: string, apiKey: string): Promise<void> {
    const encrypted = encryptApiKey(apiKey);
    await db.update(users).set({ aiProvider: provider, aiApiKey: encrypted }).where(eq(users.id, userId));
  }

  async getAiSettings(userId: string): Promise<{ provider: string | null; hasKey: boolean }> {
    const [user] = await db.select({ aiProvider: users.aiProvider, aiApiKey: users.aiApiKey }).from(users).where(eq(users.id, userId));
    if (!user) return { provider: null, hasKey: false };
    return { provider: user.aiProvider, hasKey: !!user.aiApiKey };
  }

  async getAiApiKey(userId: string): Promise<{ provider: string | null; apiKey: string | null }> {
    const [user] = await db.select({ aiProvider: users.aiProvider, aiApiKey: users.aiApiKey }).from(users).where(eq(users.id, userId));
    if (!user) return { provider: null, apiKey: null };
    let decryptedKey: string | null = null;
    if (user.aiApiKey) {
      try { decryptedKey = decryptApiKey(user.aiApiKey); } catch { decryptedKey = null; }
    }
    return { provider: user.aiProvider, apiKey: decryptedKey };
  }

  async clearAiSettings(userId: string): Promise<void> {
    await db.update(users).set({ aiProvider: null, aiApiKey: null }).where(eq(users.id, userId));
  }

  async getChatConversations(userId: string): Promise<ChatConversation[]> {
    return db.select().from(chatConversations).where(eq(chatConversations.userId, userId)).orderBy(desc(chatConversations.createdAt));
  }

  async createChatConversation(userId: string, title: string): Promise<ChatConversation> {
    const [conv] = await db.insert(chatConversations).values({ userId, title }).returning();
    return conv;
  }

  async updateChatConversationTitle(id: string, userId: string, title: string): Promise<ChatConversation | undefined> {
    const [conv] = await db.update(chatConversations).set({ title }).where(and(eq(chatConversations.id, id), eq(chatConversations.userId, userId))).returning();
    return conv;
  }

  async deleteChatConversation(id: string, userId: string): Promise<void> {
    await db.delete(chatConversations).where(and(eq(chatConversations.id, id), eq(chatConversations.userId, userId)));
  }

  async getChatMessages(conversationId: string, userId: string): Promise<ChatMessage[]> {
    const [conv] = await db.select().from(chatConversations).where(and(eq(chatConversations.id, conversationId), eq(chatConversations.userId, userId)));
    if (!conv) return [];
    return db.select().from(chatMessages).where(eq(chatMessages.conversationId, conversationId)).orderBy(asc(chatMessages.createdAt));
  }

  async addChatMessage(conversationId: string, userId: string, role: string, content: string): Promise<ChatMessage> {
    const [conv] = await db.select().from(chatConversations).where(and(eq(chatConversations.id, conversationId), eq(chatConversations.userId, userId)));
    if (!conv) throw new Error("Conversation not found");
    const [msg] = await db.insert(chatMessages).values({ conversationId, role, content }).returning();
    return msg;
  }
}

export const storage = new DatabaseStorage();

import { db } from "./db";
import {
  users, tasks, completedTasks, withdrawals, announcements, referralSettings, referrals,
  type User, type InsertUser, type Task, type InsertTask, type Withdrawal, type InsertWithdrawal,
  type Announcement, type InsertAnnouncement, type ReferralSetting, type InsertReferralSetting,
  type Referral, type CompletedTask
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByReferralCode(code: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Tasks
  getTasksByCountry(country: string): Promise<Task[]>;
  getAllTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  deleteTask(id: number): Promise<void>;
  
  // Completed Tasks
  getCompletedTasks(userId: number): Promise<CompletedTask[]>;
  completeTask(userId: number, taskId: number, reward: string, transactionId?: string): Promise<void>;
  hasUserCompletedTask(userId: number, taskId: number): Promise<boolean>;

  // Withdrawals
  getWithdrawals(userId: number): Promise<Withdrawal[]>;
  getAllWithdrawals(): Promise<(Withdrawal & { username: string; country: string })[]>;
  createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal>;
  updateWithdrawalStatus(id: number, status: string): Promise<Withdrawal>;

  // Announcements
  getAnnouncements(country?: string): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  deleteAnnouncement(id: number): Promise<void>;

  // Referrals
  getReferralSettings(): Promise<ReferralSetting[]>;
  upsertReferralSetting(setting: InsertReferralSetting): Promise<ReferralSetting>;
  getReferralSettingByCountry(country: string): Promise<ReferralSetting | undefined>;
  createReferral(referrerId: number, referredUserId: number, country: string): Promise<Referral>;
  getReferralsByUser(referrerId: number): Promise<Referral[]>;
  completeReferral(referralId: number, reward: string): Promise<void>;
  getPendingReferral(referredUserId: number): Promise<Referral | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByReferralCode(code: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.referralCode, code));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return updated;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Tasks
  async getTasksByCountry(country: string): Promise<Task[]> {
    return await db.select().from(tasks).where(and(eq(tasks.country, country), eq(tasks.isActive, true)));
  }

  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Completed Tasks
  async getCompletedTasks(userId: number): Promise<CompletedTask[]> {
    return await db.select().from(completedTasks).where(eq(completedTasks.userId, userId));
  }

  async completeTask(userId: number, taskId: number, reward: string, transactionId?: string): Promise<void> {
    await db.transaction(async (tx) => {
      // 1. Record completion
      await tx.insert(completedTasks).values({
        userId,
        taskId,
        rewardEarned: reward,
        transactionId,
      });

      // 2. Update user balance
      await tx.execute(sql`
        UPDATE users 
        SET balance_task = balance_task + ${reward} 
        WHERE id = ${userId}
      `);
    });
  }

  async hasUserCompletedTask(userId: number, taskId: number): Promise<boolean> {
    const [completion] = await db.select().from(completedTasks)
      .where(and(eq(completedTasks.userId, userId), eq(completedTasks.taskId, taskId)));
    return !!completion;
  }

  // Withdrawals
  async getWithdrawals(userId: number): Promise<Withdrawal[]> {
    return await db.select().from(withdrawals).where(eq(withdrawals.userId, userId)).orderBy(desc(withdrawals.createdAt));
  }

  async getAllWithdrawals(): Promise<(Withdrawal & { username: string; country: string })[]> {
    return await db.select({
      id: withdrawals.id,
      userId: withdrawals.userId,
      amount: withdrawals.amount,
      walletAddress: withdrawals.walletAddress,
      network: withdrawals.network,
      status: withdrawals.status,
      createdAt: withdrawals.createdAt,
      username: users.username,
      country: users.country,
    })
    .from(withdrawals)
    .innerJoin(users, eq(withdrawals.userId, users.id))
    .orderBy(desc(withdrawals.createdAt));
  }

  async createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal> {
    const [newWithdrawal] = await db.insert(withdrawals).values(withdrawal).returning();
    return newWithdrawal;
  }

  async updateWithdrawalStatus(id: number, status: string): Promise<Withdrawal> {
    const [updated] = await db.update(withdrawals).set({ status }).where(eq(withdrawals.id, id)).returning();
    return updated;
  }

  // Announcements
  async getAnnouncements(country?: string): Promise<Announcement[]> {
    if (country) {
      return await db.select().from(announcements)
        .where(and(eq(announcements.isActive, true), sql`(${announcements.country} IS NULL OR ${announcements.country} = ${country})`))
        .orderBy(desc(announcements.createdAt));
    }
    return await db.select().from(announcements).where(eq(announcements.isActive, true)).orderBy(desc(announcements.createdAt));
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [newAnnouncement] = await db.insert(announcements).values(announcement).returning();
    return newAnnouncement;
  }

  async deleteAnnouncement(id: number): Promise<void> {
    await db.delete(announcements).where(eq(announcements.id, id));
  }

  // Referrals
  async getReferralSettings(): Promise<ReferralSetting[]> {
    return await db.select().from(referralSettings);
  }

  async upsertReferralSetting(setting: InsertReferralSetting): Promise<ReferralSetting> {
    // Check if exists
    const [existing] = await db.select().from(referralSettings).where(eq(referralSettings.country, setting.country));
    if (existing) {
      const [updated] = await db.update(referralSettings)
        .set({ 
          rewardAmount: setting.rewardAmount, 
          minWithdrawal: setting.minWithdrawal || "20",
          updatedAt: new Date() 
        })
        .where(eq(referralSettings.id, existing.id))
        .returning();
      return updated;
    }
    const [inserted] = await db.insert(referralSettings).values(setting).returning();
    return inserted;
  }

  async getReferralSettingByCountry(country: string): Promise<ReferralSetting | undefined> {
    const [setting] = await db.select().from(referralSettings).where(eq(referralSettings.country, country));
    return setting;
  }

  async createReferral(referrerId: number, referredUserId: number, country: string): Promise<Referral> {
    const [referral] = await db.insert(referrals).values({
      referrerId,
      referredUserId,
      country,
      status: 'pending'
    }).returning();
    return referral;
  }

  async getReferralsByUser(referrerId: number): Promise<Referral[]> {
    return await db.select().from(referrals).where(eq(referrals.referrerId, referrerId));
  }
  
  async getPendingReferral(referredUserId: number): Promise<Referral | undefined> {
    const [referral] = await db.select().from(referrals)
        .where(and(
            eq(referrals.referredUserId, referredUserId),
            eq(referrals.status, 'pending')
        ));
    return referral;
  }

  async completeReferral(referralId: number, reward: string): Promise<void> {
    await db.transaction(async (tx) => {
        // 1. Update referral status
        await tx.update(referrals)
            .set({ status: 'paid', reward })
            .where(eq(referrals.id, referralId));
            
        // 2. Get referrer id
        const [ref] = await tx.select().from(referrals).where(eq(referrals.id, referralId));
        if (ref) {
            // 3. Credit referrer
            await tx.execute(sql`
                UPDATE users 
                SET balance_referral = balance_referral + ${reward} 
                WHERE id = ${ref.referrerId}
            `);
        }
    });
  }
}

export const storage = new DatabaseStorage();

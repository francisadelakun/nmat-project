import { pgTable, text, serial, integer, numeric, boolean, timestamp, varchar, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  country: text("country").notNull(),
  phone: text("phone").notNull(),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: integer("referred_by"), // ID of the referrer
  balanceTask: numeric("balance_task", { precision: 10, scale: 2 }).default("0").notNull(),
  balanceReferral: numeric("balance_referral", { precision: 10, scale: 2 }).default("0").notNull(),
  role: text("role").default("user").notNull(), // 'user' or 'admin'
  ipAddress: text("ip_address"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  country: text("country").notNull(), // The country this task targets
  smartLink: text("smart_link").notNull(),
  tagName: text("tag_name").notNull(), // e.g., "Tag 1"
  rewardAmount: numeric("reward_amount", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const completedTasks = pgTable("completed_tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  taskId: integer("task_id").notNull(),
  transactionId: text("transaction_id"), // From Postback
  rewardEarned: numeric("reward_earned", { precision: 10, scale: 2 }).notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
}, (t) => ({
  // Ensure a user can only complete a task once
  unqUserTask: uniqueIndex("unq_user_task").on(t.userId, t.taskId),
}));

export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  walletAddress: text("wallet_address").notNull(),
  network: text("network").notNull(), // TRC20, ERC20
  status: text("status").default("pending").notNull(), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  country: text("country"), // Null means global
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const referralSettings = pgTable("referral_settings", {
  id: serial("id").primaryKey(),
  country: text("country").notNull().unique(),
  rewardAmount: numeric("reward_amount", { precision: 10, scale: 2 }).notNull(),
  minWithdrawal: numeric("min_withdrawal", { precision: 10, scale: 2 }).default("20").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull(),
  referredUserId: integer("referred_user_id").notNull(),
  country: text("country").notNull(), // Country of the REFERRED user
  reward: numeric("reward", { precision: 10, scale: 2 }).default("0").notNull(),
  status: text("status").default("pending").notNull(), // pending, paid, blocked
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// === RELATIONS ===

export const usersRelations = relations(users, ({ one, many }) => ({
  completedTasks: many(completedTasks),
  withdrawals: many(withdrawals),
  referralsMade: many(referrals, { relationName: "referrer" }),
  referral: one(referrals, {
    fields: [users.id],
    references: [referrals.referredUserId],
    relationName: "referred",
  }),
}));

export const tasksRelations = relations(tasks, ({ many }) => ({
  completions: many(completedTasks),
}));

export const completedTasksRelations = relations(completedTasks, ({ one }) => ({
  user: one(users, {
    fields: [completedTasks.userId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [completedTasks.taskId],
    references: [tasks.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  balanceTask: true,
  balanceReferral: true,
  isActive: true,
  role: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const insertWithdrawalSchema = createInsertSchema(withdrawals).omit({
  id: true,
  userId: true,
  status: true,
  createdAt: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
});

export const insertReferralSettingSchema = createInsertSchema(referralSettings).omit({
  id: true,
  updatedAt: true,
});


// === TYPES ===
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type CompletedTask = typeof completedTasks.$inferSelect;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type ReferralSetting = typeof referralSettings.$inferSelect;
export type InsertReferralSetting = z.infer<typeof insertReferralSettingSchema>;
export type Referral = typeof referrals.$inferSelect;

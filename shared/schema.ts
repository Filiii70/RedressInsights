import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Companies table - stores business entities from VAT lookups and invoice data
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vatNumber: text("vat_number").notNull().unique(),
  name: text("name").notNull(),
  sector: text("sector"),
  size: text("size"), // 'micro', 'small', 'medium', 'large'
  foundingDate: text("founding_date"),
  country: text("country").default("BE"),
  address: text("address"),
  isCustomer: boolean("is_customer").default(false), // Is this company our customer?
  createdAt: timestamp("created_at").defaultNow(),
});

// Invoices table - stores uploaded invoice data
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  invoiceNumber: text("invoice_number"),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").default("EUR"),
  invoiceDate: timestamp("invoice_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  paymentDate: timestamp("payment_date"),
  status: text("status").notNull().default("pending"), // 'pending', 'paid', 'overdue'
  daysLate: integer("days_late").default(0),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment behavior aggregated data per company
export const paymentBehavior = pgTable("payment_behavior", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id).unique(),
  totalInvoices: integer("total_invoices").default(0),
  paidInvoices: integer("paid_invoices").default(0),
  avgDaysLate: decimal("avg_days_late", { precision: 6, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 14, scale: 2 }).default("0"),
  paidAmount: decimal("paid_amount", { precision: 14, scale: 2 }).default("0"),
  riskScore: integer("risk_score").default(50), // 0-100
  trend: text("trend").default("stable"), // 'improving', 'stable', 'worsening'
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Sector benchmarks for comparison
export const sectorBenchmarks = pgTable("sector_benchmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sector: text("sector").notNull().unique(),
  avgDaysLate: decimal("avg_days_late", { precision: 6, scale: 2 }).default("0"),
  avgRiskScore: integer("avg_risk_score").default(50),
  totalCompanies: integer("total_companies").default(0),
});

// Define relations
export const companiesRelations = relations(companies, ({ many, one }) => ({
  invoices: many(invoices),
  paymentBehavior: one(paymentBehavior),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  company: one(companies, {
    fields: [invoices.companyId],
    references: [companies.id],
  }),
}));

export const paymentBehaviorRelations = relations(paymentBehavior, ({ one }) => ({
  company: one(companies, {
    fields: [paymentBehavior.companyId],
    references: [companies.id],
  }),
}));

// Insert schemas
export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  daysLate: true,
  status: true,
});

export const insertPaymentBehaviorSchema = createInsertSchema(paymentBehavior).omit({
  id: true,
  lastUpdated: true,
});

// Types
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type PaymentBehavior = typeof paymentBehavior.$inferSelect;
export type InsertPaymentBehavior = z.infer<typeof insertPaymentBehaviorSchema>;

export type SectorBenchmark = typeof sectorBenchmarks.$inferSelect;

// Extended types for frontend
export type CompanyWithBehavior = Company & {
  paymentBehavior?: PaymentBehavior | null;
  invoiceCount?: number;
};

export type InvoiceWithCompany = Invoice & {
  company: Company;
};

export type DashboardStats = {
  totalOutstanding: number;
  totalPaid: number;
  avgDaysLate: number;
  highRiskClients: number;
  pendingInvoices: number;
  overdueInvoices: number;
  // Positive metrics
  onTimePayments: number;
  reliableClients: number;
  paidThisMonth: number;
  improvedClients: number;
};

export type ActionPlan = {
  recommendedPaymentTerms: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  actions: string[];
  emailScript: string;
  phoneScript: string;
  escalationAdvice: string;
};

// User table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Streak tracking
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActivityDate: timestamp("last_activity_date"),
  totalInvoicesUploaded: integer("total_invoices_uploaded").default(0),
  totalPaymentsRegistered: integer("total_payments_registered").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// User streak and engagement stats for gamification
export type UserStreakInfo = {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
  streakActive: boolean; // true if user has activity today or yesterday
};

// Leaderboard entry
export type LeaderboardEntry = {
  userId: string;
  userName: string;
  profileImageUrl: string | null;
  invoicesUploaded: number;
  paymentsRegistered: number;
  totalActivity: number;
  currentStreak: number;
  rank: number;
};

// Portfolio Risk Score
export type PortfolioRiskScore = {
  score: number; // 0-10 scale
  trend: 'up' | 'down' | 'stable';
  changeThisWeek: number;
  totalOutstanding: number;
  highRiskAmount: number;
  mediumRiskAmount: number;
  lowRiskAmount: number;
};

// ============================================
// NOTIFICATION & ENGAGEMENT SYSTEM
// ============================================

// Company contacts - business contact info for notifications (GDPR: no personal data)
export const companyContacts = pgTable("company_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  email: text("email"),
  phone: text("phone"), // For SMS
  whatsapp: text("whatsapp"), // WhatsApp number
  emailEnabled: boolean("email_enabled").default(true),
  smsEnabled: boolean("sms_enabled").default(false),
  whatsappEnabled: boolean("whatsapp_enabled").default(false),
  weeklyDigest: boolean("weekly_digest").default(true),
  paymentReminders: boolean("payment_reminders").default(true),
  criticalAlerts: boolean("critical_alerts").default(true), // 30+ days overdue
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notification queue - tracks all sent notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  invoiceId: varchar("invoice_id").references(() => invoices.id),
  type: text("type").notNull(), // 'onboarding', 'weekly_digest', 'payment_reminder', 'critical_alert'
  channel: text("channel").notNull(), // 'email', 'sms', 'whatsapp'
  status: text("status").notNull().default("pending"), // 'pending', 'sent', 'failed', 'delivered'
  subject: text("subject"),
  content: text("content"),
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Invoice quick-links for QR codes - "Betaald? Registreer in 30 sec"
export const invoiceQuickLinks = pgTable("invoice_quick_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").notNull().references(() => invoices.id).unique(),
  token: text("token").notNull().unique(), // Short unique token for QR
  qrCodeUrl: text("qr_code_url"), // Stored QR code image URL
  clicks: integer("clicks").default(0),
  lastClickedAt: timestamp("last_clicked_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Engagement events - track user actions for gamification
export const engagementEvents = pgTable("engagement_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  eventType: text("event_type").notNull(), // 'invoice_uploaded', 'payment_registered', 'qr_scanned', 'reminder_sent'
  invoiceId: varchar("invoice_id").references(() => invoices.id),
  metadata: text("metadata"), // JSON string for extra data
  createdAt: timestamp("created_at").defaultNow(),
});

// Weekly engagement snapshots for gamification benchmarks
export const weeklySnapshots = pgTable("weekly_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  weekStart: timestamp("week_start").notNull(),
  invoicesUploaded: integer("invoices_uploaded").default(0),
  paymentsRegistered: integer("payments_registered").default(0),
  qrScans: integer("qr_scans").default(0),
  remindersSent: integer("reminders_sent").default(0),
  rank: integer("rank"), // Position in weekly leaderboard
  percentile: integer("percentile"), // Top X%
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations for new tables
export const companyContactsRelations = relations(companyContacts, ({ one }) => ({
  company: one(companies, {
    fields: [companyContacts.companyId],
    references: [companies.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  company: one(companies, {
    fields: [notifications.companyId],
    references: [companies.id],
  }),
  invoice: one(invoices, {
    fields: [notifications.invoiceId],
    references: [invoices.id],
  }),
}));

export const invoiceQuickLinksRelations = relations(invoiceQuickLinks, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceQuickLinks.invoiceId],
    references: [invoices.id],
  }),
}));

export const engagementEventsRelations = relations(engagementEvents, ({ one }) => ({
  company: one(companies, {
    fields: [engagementEvents.companyId],
    references: [companies.id],
  }),
  invoice: one(invoices, {
    fields: [engagementEvents.invoiceId],
    references: [invoices.id],
  }),
}));

export const weeklySnapshotsRelations = relations(weeklySnapshots, ({ one }) => ({
  company: one(companies, {
    fields: [weeklySnapshots.companyId],
    references: [companies.id],
  }),
}));

// Insert schemas for new tables
export const insertCompanyContactSchema = createInsertSchema(companyContacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertQuickLinkSchema = createInsertSchema(invoiceQuickLinks).omit({
  id: true,
  createdAt: true,
  clicks: true,
  lastClickedAt: true,
});

export const insertEngagementEventSchema = createInsertSchema(engagementEvents).omit({
  id: true,
  createdAt: true,
});

export const insertWeeklySnapshotSchema = createInsertSchema(weeklySnapshots).omit({
  id: true,
  createdAt: true,
});

// Types for new tables
export type CompanyContact = typeof companyContacts.$inferSelect;
export type InsertCompanyContact = z.infer<typeof insertCompanyContactSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type InvoiceQuickLink = typeof invoiceQuickLinks.$inferSelect;
export type InsertQuickLink = z.infer<typeof insertQuickLinkSchema>;

export type EngagementEvent = typeof engagementEvents.$inferSelect;
export type InsertEngagementEvent = z.infer<typeof insertEngagementEventSchema>;

export type WeeklySnapshot = typeof weeklySnapshots.$inferSelect;
export type InsertWeeklySnapshot = z.infer<typeof insertWeeklySnapshotSchema>;

// Extended types for engagement/gamification
export type WeeklyLeaderboard = {
  companyId: string;
  companyName: string;
  invoicesUploaded: number;
  paymentsRegistered: number;
  totalActivity: number;
  rank: number;
};

export type EngagementStats = {
  thisWeek: {
    invoicesUploaded: number;
    paymentsRegistered: number;
    qrScans: number;
  };
  lastWeek: {
    invoicesUploaded: number;
    paymentsRegistered: number;
    qrScans: number;
  };
  networkAverage: {
    invoicesUploaded: number;
    paymentsRegistered: number;
  };
  rank: number;
  percentile: number;
};

// ============================================
// LIVE ACTIVITY FEED
// ============================================

// Activity feed for live ticker - all system events
export const activityFeed = pgTable("activity_feed", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventType: text("event_type").notNull(), // 'invoice_uploaded', 'payment_registered', 'risk_alert', 'company_added', 'overdue_warning'
  companyId: varchar("company_id").references(() => companies.id),
  invoiceId: varchar("invoice_id").references(() => invoices.id),
  message: text("message").notNull(), // Human-readable message for ticker
  severity: text("severity").default("info"), // 'info', 'warning', 'critical'
  amount: decimal("amount", { precision: 12, scale: 2 }), // Optional amount for financial events
  metadata: text("metadata"), // JSON for extra data
  createdAt: timestamp("created_at").defaultNow(),
});

export const activityFeedRelations = relations(activityFeed, ({ one }) => ({
  company: one(companies, {
    fields: [activityFeed.companyId],
    references: [companies.id],
  }),
  invoice: one(invoices, {
    fields: [activityFeed.invoiceId],
    references: [invoices.id],
  }),
}));

export const insertActivityFeedSchema = createInsertSchema(activityFeed).omit({
  id: true,
  createdAt: true,
});

export type ActivityFeedItem = typeof activityFeed.$inferSelect;
export type InsertActivityFeedItem = z.infer<typeof insertActivityFeedSchema>;

// Activity feed with company info for display
export type ActivityFeedWithCompany = ActivityFeedItem & {
  company?: Company | null;
};

// ============================================
// BLACKLIST SYSTEM
// ============================================

// Blacklist entries for risky companies
export const blacklistEntries = pgTable("blacklist_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  reason: text("reason"), // Why was this company blacklisted?
  riskScoreAtTime: integer("risk_score_at_time"), // Risk score when blacklisted
  status: text("status").notNull().default("active"), // 'active', 'resolved', 'reviewing'
  notes: text("notes"), // Additional notes
  addedBy: varchar("added_by"), // User ID who added
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const blacklistEntriesRelations = relations(blacklistEntries, ({ one }) => ({
  company: one(companies, {
    fields: [blacklistEntries.companyId],
    references: [companies.id],
  }),
}));

export const insertBlacklistEntrySchema = createInsertSchema(blacklistEntries).omit({
  id: true,
  createdAt: true,
});

export type BlacklistEntry = typeof blacklistEntries.$inferSelect;
export type InsertBlacklistEntry = z.infer<typeof insertBlacklistEntrySchema>;

// Blacklist entry with company info for display
export type BlacklistEntryWithCompany = BlacklistEntry & {
  company: Company;
  paymentBehavior?: PaymentBehavior | null;
};

import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
};

export type ActionPlan = {
  recommendedPaymentTerms: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  actions: string[];
  emailScript: string;
  phoneScript: string;
  escalationAdvice: string;
};

// Legacy user schema for compatibility
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

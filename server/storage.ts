import { 
  companies, invoices, paymentBehavior, sectorBenchmarks,
  companyContacts, notifications, invoiceQuickLinks, engagementEvents, weeklySnapshots,
  users, activityFeed, blacklistEntries,
  type Company, type InsertCompany, 
  type Invoice, type InsertInvoice,
  type PaymentBehavior, type InsertPaymentBehavior,
  type CompanyWithBehavior, type InvoiceWithCompany, type DashboardStats,
  type ActionPlan,
  type CompanyContact, type InsertCompanyContact,
  type Notification, type InsertNotification,
  type InvoiceQuickLink, type InsertQuickLink,
  type EngagementEvent, type InsertEngagementEvent,
  type WeeklySnapshot, type InsertWeeklySnapshot,
  type WeeklyLeaderboard, type EngagementStats,
  type User, type UpsertUser,
  type ActivityFeedItem, type InsertActivityFeedItem, type ActivityFeedWithCompany,
  type BlacklistEntry, type InsertBlacklistEntry, type BlacklistEntryWithCompany,
  type UserStreakInfo, type LeaderboardEntry, type PortfolioRiskScore
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql, count, inArray } from "drizzle-orm";

export interface IStorage {
  // Companies
  getCompany(id: string): Promise<CompanyWithBehavior | undefined>;
  getCompanyByVat(vatNumber: string): Promise<CompanyWithBehavior | undefined>;
  getAllCompanies(): Promise<CompanyWithBehavior[]>;
  getRiskyCompanies(minScore: number): Promise<CompanyWithBehavior[]>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company | undefined>;

  // Invoices
  getInvoice(id: string): Promise<InvoiceWithCompany | undefined>;
  getInvoicesByCompany(companyId: string): Promise<Invoice[]>;
  getAllInvoices(): Promise<InvoiceWithCompany[]>;
  getRecentInvoices(limit: number): Promise<InvoiceWithCompany[]>;
  getCriticalInvoices(limit: number): Promise<InvoiceWithCompany[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice | undefined>;

  // Payment Behavior
  getPaymentBehavior(companyId: string): Promise<PaymentBehavior | undefined>;
  upsertPaymentBehavior(behavior: InsertPaymentBehavior & { companyId: string }): Promise<PaymentBehavior>;
  recalculatePaymentBehavior(companyId: string): Promise<void>;

  // Dashboard
  getDashboardStats(): Promise<DashboardStats>;

  // Action Plan
  getActionPlan(companyId: string): Promise<ActionPlan>;

  // Company Contacts (Notifications)
  getCompanyContact(companyId: string): Promise<CompanyContact | undefined>;
  getCompanyContactById(id: string): Promise<CompanyContact | undefined>;
  createCompanyContact(contact: InsertCompanyContact): Promise<CompanyContact>;
  updateCompanyContact(id: string, updates: Partial<InsertCompanyContact>): Promise<CompanyContact | undefined>;
  upsertCompanyContact(contact: InsertCompanyContact): Promise<CompanyContact>;

  // Notifications
  getNotifications(companyId?: string): Promise<Notification[]>;
  getPendingNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  updateNotificationStatus(id: string, status: string, errorMessage?: string): Promise<Notification | undefined>;

  // Invoice Quick Links (QR Codes)
  getQuickLink(token: string): Promise<InvoiceQuickLink | undefined>;
  getQuickLinkByInvoice(invoiceId: string): Promise<InvoiceQuickLink | undefined>;
  createQuickLink(quickLink: InsertQuickLink): Promise<InvoiceQuickLink>;
  incrementQuickLinkClicks(token: string): Promise<void>;

  // Engagement Events (Gamification)
  createEngagementEvent(event: InsertEngagementEvent): Promise<EngagementEvent>;
  getWeeklyLeaderboard(): Promise<WeeklyLeaderboard[]>;
  getEngagementStats(companyId: string): Promise<EngagementStats>;
  getOverdueInvoicesForAlerts(daysOverdue: number): Promise<InvoiceWithCompany[]>;

  // User operations (Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Activity Feed (Live Ticker)
  getActivityFeed(limit: number): Promise<ActivityFeedWithCompany[]>;
  getActivityFeedSince(since: Date): Promise<ActivityFeedWithCompany[]>;
  getPublicNetworkFeed(limit: number): Promise<ActivityFeedWithCompany[]>; // Only public events
  createActivityEvent(event: InsertActivityFeedItem): Promise<ActivityFeedItem>;
  getNewActivityCount(since: Date): Promise<number>;

  // Blacklist
  getBlacklistEntries(): Promise<BlacklistEntryWithCompany[]>;
  getBlacklistEntry(id: string): Promise<BlacklistEntryWithCompany | undefined>;
  isCompanyBlacklisted(companyId: string): Promise<boolean>;
  addToBlacklist(entry: InsertBlacklistEntry): Promise<BlacklistEntry>;
  updateBlacklistEntry(id: string, updates: Partial<InsertBlacklistEntry>): Promise<BlacklistEntry | undefined>;
  removeFromBlacklist(id: string): Promise<void>;
  autoBlacklistHighRiskCompanies(): Promise<number>; // Returns count of newly blacklisted

  // Streak System (Gamification)
  getUserStreak(userId: string): Promise<UserStreakInfo>;
  updateUserStreak(userId: string): Promise<UserStreakInfo>;
  incrementUserActivity(userId: string, type: 'invoice' | 'payment'): Promise<void>;

  // Leaderboard
  getUserLeaderboard(period: 'week' | 'month' | 'all'): Promise<LeaderboardEntry[]>;

  // Portfolio Risk Score
  getPortfolioRiskScore(): Promise<PortfolioRiskScore>;
}

export class DatabaseStorage implements IStorage {
  // Companies
  async getCompany(id: string): Promise<CompanyWithBehavior | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    if (!company) return undefined;

    const [behavior] = await db.select().from(paymentBehavior).where(eq(paymentBehavior.companyId, id));
    return { ...company, paymentBehavior: behavior || null };
  }

  async getCompanyByVat(vatNumber: string): Promise<CompanyWithBehavior | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.vatNumber, vatNumber));
    if (!company) return undefined;

    const [behavior] = await db.select().from(paymentBehavior).where(eq(paymentBehavior.companyId, company.id));
    return { ...company, paymentBehavior: behavior || null };
  }

  async getAllCompanies(): Promise<CompanyWithBehavior[]> {
    const allCompanies = await db.select().from(companies).orderBy(desc(companies.createdAt));
    
    const result: CompanyWithBehavior[] = [];
    for (const company of allCompanies) {
      const [behavior] = await db.select().from(paymentBehavior).where(eq(paymentBehavior.companyId, company.id));
      result.push({ ...company, paymentBehavior: behavior || null });
    }
    return result;
  }

  async getRiskyCompanies(minScore: number): Promise<CompanyWithBehavior[]> {
    const behaviors = await db.select()
      .from(paymentBehavior)
      .where(gte(paymentBehavior.riskScore, minScore))
      .orderBy(desc(paymentBehavior.riskScore));

    const result: CompanyWithBehavior[] = [];
    for (const behavior of behaviors) {
      const [company] = await db.select().from(companies).where(eq(companies.id, behavior.companyId));
      if (company) {
        result.push({ ...company, paymentBehavior: behavior });
      }
    }
    return result;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company | undefined> {
    const [updated] = await db.update(companies).set(company).where(eq(companies.id, id)).returning();
    return updated;
  }

  // Invoices
  async getInvoice(id: string): Promise<InvoiceWithCompany | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    if (!invoice) return undefined;

    const [company] = await db.select().from(companies).where(eq(companies.id, invoice.companyId));
    return { ...invoice, company: company! };
  }

  async getInvoicesByCompany(companyId: string): Promise<Invoice[]> {
    return db.select().from(invoices).where(eq(invoices.companyId, companyId)).orderBy(desc(invoices.dueDate));
  }

  async getAllInvoices(): Promise<InvoiceWithCompany[]> {
    const allInvoices = await db.select().from(invoices).orderBy(desc(invoices.createdAt));
    
    const result: InvoiceWithCompany[] = [];
    for (const invoice of allInvoices) {
      const [company] = await db.select().from(companies).where(eq(companies.id, invoice.companyId));
      if (company) {
        result.push({ ...invoice, company });
      }
    }
    return result;
  }

  async getRecentInvoices(limit: number): Promise<InvoiceWithCompany[]> {
    const recentInvoices = await db.select().from(invoices).orderBy(desc(invoices.createdAt)).limit(limit);
    
    const result: InvoiceWithCompany[] = [];
    for (const invoice of recentInvoices) {
      const [company] = await db.select().from(companies).where(eq(companies.id, invoice.companyId));
      if (company) {
        result.push({ ...invoice, company });
      }
    }
    return result;
  }

  async getCriticalInvoices(limit: number): Promise<InvoiceWithCompany[]> {
    // Get overdue invoices sorted by daysLate descending (worst first)
    const criticalInvoices = await db.select()
      .from(invoices)
      .where(eq(invoices.status, "overdue"))
      .orderBy(desc(invoices.daysLate))
      .limit(limit);
    
    const result: InvoiceWithCompany[] = [];
    for (const invoice of criticalInvoices) {
      const [company] = await db.select().from(companies).where(eq(companies.id, invoice.companyId));
      if (company) {
        result.push({ ...invoice, company });
      }
    }
    return result;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    // Calculate days late if overdue
    const now = new Date();
    const dueDate = new Date(invoice.dueDate);
    let status: "pending" | "paid" | "overdue" = "pending";
    let daysLate = 0;

    if (invoice.paymentDate) {
      status = "paid";
      const paymentDate = new Date(invoice.paymentDate);
      if (paymentDate > dueDate) {
        daysLate = Math.ceil((paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      }
    } else if (now > dueDate) {
      status = "overdue";
      daysLate = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    const [newInvoice] = await db.insert(invoices).values({
      ...invoice,
      status,
      daysLate,
    }).returning();

    // Recalculate payment behavior for the company
    await this.recalculatePaymentBehavior(invoice.companyId);

    return newInvoice;
  }

  async updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice | undefined> {
    const [updated] = await db.update(invoices).set(invoice).where(eq(invoices.id, id)).returning();
    if (updated) {
      await this.recalculatePaymentBehavior(updated.companyId);
    }
    return updated;
  }

  // Payment Behavior
  async getPaymentBehavior(companyId: string): Promise<PaymentBehavior | undefined> {
    const [behavior] = await db.select().from(paymentBehavior).where(eq(paymentBehavior.companyId, companyId));
    return behavior;
  }

  async upsertPaymentBehavior(behavior: InsertPaymentBehavior & { companyId: string }): Promise<PaymentBehavior> {
    const existing = await this.getPaymentBehavior(behavior.companyId);
    
    if (existing) {
      const [updated] = await db.update(paymentBehavior)
        .set({ ...behavior, lastUpdated: new Date() })
        .where(eq(paymentBehavior.companyId, behavior.companyId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(paymentBehavior).values(behavior).returning();
      return created;
    }
  }

  async recalculatePaymentBehavior(companyId: string): Promise<void> {
    const companyInvoices = await this.getInvoicesByCompany(companyId);
    
    if (companyInvoices.length === 0) return;

    const totalInvoices = companyInvoices.length;
    const paidInvoices = companyInvoices.filter(i => i.status === "paid").length;
    const totalAmount = companyInvoices.reduce((sum, i) => sum + parseFloat(i.amount.toString()), 0);
    const paidAmount = companyInvoices
      .filter(i => i.status === "paid")
      .reduce((sum, i) => sum + parseFloat(i.amount.toString()), 0);
    
    const avgDaysLate = companyInvoices.reduce((sum, i) => sum + (i.daysLate || 0), 0) / totalInvoices;
    
    // Calculate risk score (0-100)
    // Factors: avg days late, payment rate, overdue rate
    const paymentRate = paidInvoices / totalInvoices;
    const overdueRate = companyInvoices.filter(i => i.status === "overdue").length / totalInvoices;
    
    let riskScore = 50; // Base score
    riskScore += Math.min(avgDaysLate * 1.5, 30); // +30 max for days late
    riskScore += overdueRate * 20; // +20 max for overdue rate
    riskScore -= paymentRate * 20; // -20 for good payment rate
    riskScore = Math.max(0, Math.min(100, Math.round(riskScore)));

    // Determine trend based on recent invoices
    const recentInvoices = companyInvoices.slice(0, 5);
    const olderInvoices = companyInvoices.slice(5, 10);
    
    let trend: "improving" | "stable" | "worsening" = "stable";
    if (recentInvoices.length >= 3 && olderInvoices.length >= 3) {
      const recentAvgLate = recentInvoices.reduce((sum, i) => sum + (i.daysLate || 0), 0) / recentInvoices.length;
      const olderAvgLate = olderInvoices.reduce((sum, i) => sum + (i.daysLate || 0), 0) / olderInvoices.length;
      
      if (recentAvgLate < olderAvgLate - 3) trend = "improving";
      else if (recentAvgLate > olderAvgLate + 3) trend = "worsening";
    }

    await this.upsertPaymentBehavior({
      companyId,
      totalInvoices,
      paidInvoices,
      avgDaysLate: avgDaysLate.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      paidAmount: paidAmount.toFixed(2),
      riskScore,
      trend,
    });
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    // ONLY get invoices for KMO-Alert's own customers (isCustomer = true)
    const customerCompanies = await db.select().from(companies).where(eq(companies.isCustomer, true));
    const customerIds = customerCompanies.map(c => c.id);
    
    // Get only OUR invoices (to our customers)
    const allInvoices = customerIds.length > 0 
      ? await db.select().from(invoices).where(inArray(invoices.companyId, customerIds))
      : [];
    
    const pendingInvoices = allInvoices.filter(i => i.status === "pending");
    const overdueInvoices = allInvoices.filter(i => i.status === "overdue");
    const paidInvoices = allInvoices.filter(i => i.status === "paid");

    const totalOutstanding = [...pendingInvoices, ...overdueInvoices]
      .reduce((sum, i) => sum + parseFloat(i.amount.toString()), 0);
    
    const totalPaid = paidInvoices
      .reduce((sum, i) => sum + parseFloat(i.amount.toString()), 0);

    const avgDaysLate = allInvoices.length > 0
      ? allInvoices.reduce((sum, i) => sum + (i.daysLate || 0), 0) / allInvoices.length
      : 0;

    // Only count behaviors for OUR customers
    const behaviors = customerIds.length > 0
      ? await db.select().from(paymentBehavior).where(inArray(paymentBehavior.companyId, customerIds))
      : [];
    const highRiskClients = behaviors.filter(b => (b.riskScore || 0) > 70).length;

    // Positive metrics
    const onTimePayments = paidInvoices.filter(i => (i.daysLate || 0) <= 0).length;
    const reliableClients = behaviors.filter(b => (b.riskScore || 0) <= 30).length;
    
    // Paid this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const paidThisMonth = paidInvoices
      .filter(i => i.paymentDate && new Date(i.paymentDate) >= startOfMonth)
      .reduce((sum, i) => sum + parseFloat(i.amount.toString()), 0);
    
    // Clients whose risk improved (trend = improving)
    const improvedClients = behaviors.filter(b => b.trend === 'improving').length;

    return {
      totalOutstanding,
      totalPaid,
      avgDaysLate,
      highRiskClients,
      pendingInvoices: pendingInvoices.length,
      overdueInvoices: overdueInvoices.length,
      onTimePayments,
      reliableClients,
      paidThisMonth,
      improvedClients,
    };
  }

  // Action Plan
  async getActionPlan(companyId: string): Promise<ActionPlan> {
    const behavior = await this.getPaymentBehavior(companyId);
    const company = await this.getCompany(companyId);
    const riskScore = behavior?.riskScore || 50;
    const avgDaysLate = parseFloat(behavior?.avgDaysLate?.toString() || "0");

    let urgencyLevel: "low" | "medium" | "high" | "critical" = "low";
    let recommendedPaymentTerms = "30 dagen";
    let actions: string[] = [];
    let emailScript = "";
    let phoneScript = "";
    let escalationAdvice = "";

    if (riskScore <= 30) {
      urgencyLevel = "low";
      recommendedPaymentTerms = "30 dagen";
      actions = [
        "Standaard facturatie met 30 dagen betaaltermijn",
        "Automatische herinnering na vervaldatum",
        "Periodieke review van betalingsgedrag"
      ];
      emailScript = `Geachte heer/mevrouw,

Hierbij ontvangt u onze factuur voor de geleverde diensten/producten.

De betalingstermijn is 30 dagen na factuurdatum.

Bij vragen kunt u contact met ons opnemen.

Met vriendelijke groet`;
      phoneScript = "Standaard opvolging niet nodig bij deze klant.";
      escalationAdvice = "Bij dit risicoprofiel is escalatie normaal niet nodig. Monitor wel het betalingsgedrag.";
    } else if (riskScore <= 60) {
      urgencyLevel = "medium";
      recommendedPaymentTerms = "14 dagen";
      actions = [
        "Verkort de betaaltermijn naar 14 dagen",
        "Stuur een vriendelijke herinnering 3 dagen voor vervaldatum",
        "Bel op de dag van de vervaldatum als er nog niet betaald is",
        "Houd het openstaand saldo goed in de gaten"
      ];
      emailScript = `Geachte heer/mevrouw,

Hierbij ontvangt u onze factuur voor de geleverde diensten/producten.

Gezien onze samenwerking hanteren wij een betaaltermijn van 14 dagen.

Mocht u vragen hebben over deze factuur, neem dan gerust contact met ons op.

Met vriendelijke groet`;
      phoneScript = `Goedendag, u spreekt met [naam] van [bedrijf].

Ik bel in verband met factuur [nummer] die vandaag vervalt.
Kunt u aangeven wanneer wij de betaling mogen verwachten?

[Noteer de beloofde betaaldatum en zet een reminder]`;
      escalationAdvice = "Als na 2 telefonische opvolgingen nog geen betaling, stuur een formele aanmaning per aangetekende brief.";
    } else if (riskScore <= 80) {
      urgencyLevel = "high";
      recommendedPaymentTerms = "7 dagen of vooruitbetaling";
      actions = [
        "Overweeg vooruitbetaling of aanbetaling te vragen",
        "Maximale betaaltermijn van 7 dagen",
        "Bel voorafgaand aan levering om betaling te bevestigen",
        "Stel een kredietlimiet in voor deze klant",
        "Overweeg leveringen te pauzeren bij openstaande facturen"
      ];
      emailScript = `Geachte heer/mevrouw,

Voordat wij uw bestelling kunnen verwerken, verzoeken wij u vriendelijk om een aanbetaling van 50% te voldoen.

Na ontvangst van deze aanbetaling zullen wij uw bestelling direct in behandeling nemen.

Het resterende bedrag dient binnen 7 dagen na levering te worden voldaan.

Voor vragen kunt u contact met ons opnemen.

Met vriendelijke groet`;
      phoneScript = `Goedendag, u spreekt met [naam] van [bedrijf].

Ik bel over factuur [nummer] die [X] dagen over de vervaldatum is.
Wij zien dat er nog een openstaand saldo is van €[bedrag].

Kunt u mij vertellen wanneer wij de betaling kunnen verwachten?

[Als geen concrete datum]
Begrijp ik het goed dat u op dit moment geen exacte datum kunt noemen?
In dat geval moet ik u informeren dat wij verdere leveringen moeten opschorten totdat het openstaande saldo is voldaan.`;
      escalationAdvice = "Schakel na 14 dagen over naar formele incasso. Overweeg een incassobureau in te schakelen. Stop alle leveringen totdat er betaald is.";
    } else {
      urgencyLevel = "critical";
      recommendedPaymentTerms = "Alleen vooruitbetaling";
      actions = [
        "ALLEEN vooruitbetaling accepteren",
        "Stop alle lopende leveringen onmiddellijk",
        "Neem direct telefonisch contact op met de klant",
        "Schakel juridische ondersteuning in indien nodig",
        "Documenteer alle communicatie zorgvuldig"
      ];
      emailScript = `AANGETEKEND

Geachte heer/mevrouw,

Ondanks eerdere herinneringen hebben wij tot op heden geen betaling ontvangen voor de volgende openstaande facturen:

[Lijst facturen]

Totaal openstaand: €[bedrag]

Wij verzoeken u dringend om binnen 7 dagen tot betaling over te gaan.

Bij uitblijven van betaling zien wij ons genoodzaakt de vordering uit handen te geven aan ons incassobureau, waarbij alle bijkomende kosten voor uw rekening komen.

Hoogachtend`;
      phoneScript = `Goedendag, u spreekt met [naam] van [bedrijf].

Ik bel in verband met de openstaande facturen ter waarde van €[bedrag].
Deze facturen zijn inmiddels [X] dagen over de vervaldatum.

Wij hebben u eerder herinneringen gestuurd maar geen reactie ontvangen.

Ik moet u informeren dat als wij vandaag geen concrete betalingsregeling kunnen afspreken, wij genoodzaakt zijn de zaak over te dragen aan ons incassobureau.

Wat kunnen wij afspreken?

[Documenteer alles wat wordt afgesproken]`;
      escalationAdvice = "Schakel onmiddellijk over naar formeel incassotraject. Overweeg betalingsregeling alleen met strikte voorwaarden en schriftelijke bevestiging. Raadpleeg juridisch adviseur voor eventuele dagvaarding.";
    }

    return {
      recommendedPaymentTerms,
      urgencyLevel,
      actions,
      emailScript,
      phoneScript,
      escalationAdvice,
    };
  }

  // Company Contacts (Notifications)
  async getCompanyContact(companyId: string): Promise<CompanyContact | undefined> {
    const [contact] = await db.select().from(companyContacts).where(eq(companyContacts.companyId, companyId));
    return contact;
  }

  async getCompanyContactById(id: string): Promise<CompanyContact | undefined> {
    const [contact] = await db.select().from(companyContacts).where(eq(companyContacts.id, id));
    return contact;
  }

  async createCompanyContact(contact: InsertCompanyContact): Promise<CompanyContact> {
    const [created] = await db.insert(companyContacts).values(contact).returning();
    return created;
  }

  async updateCompanyContact(id: string, updates: Partial<InsertCompanyContact>): Promise<CompanyContact | undefined> {
    const [updated] = await db.update(companyContacts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(companyContacts.id, id))
      .returning();
    return updated;
  }

  async upsertCompanyContact(contact: InsertCompanyContact): Promise<CompanyContact> {
    const existing = await this.getCompanyContact(contact.companyId);
    
    if (existing) {
      const [updated] = await db.update(companyContacts)
        .set({ ...contact, updatedAt: new Date() })
        .where(eq(companyContacts.companyId, contact.companyId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(companyContacts).values(contact).returning();
      return created;
    }
  }

  // Notifications
  async getNotifications(companyId?: string): Promise<Notification[]> {
    if (companyId) {
      return db.select().from(notifications)
        .where(eq(notifications.companyId, companyId))
        .orderBy(desc(notifications.createdAt));
    }
    return db.select().from(notifications).orderBy(desc(notifications.createdAt)).limit(100);
  }

  async getPendingNotifications(): Promise<Notification[]> {
    return db.select().from(notifications)
      .where(eq(notifications.status, "pending"))
      .orderBy(notifications.scheduledFor);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notification).returning();
    return created;
  }

  async updateNotificationStatus(id: string, status: string, errorMessage?: string): Promise<Notification | undefined> {
    const updateData: Partial<Notification> = { status };
    if (status === "sent") {
      updateData.sentAt = new Date();
    }
    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }
    const [updated] = await db.update(notifications)
      .set(updateData)
      .where(eq(notifications.id, id))
      .returning();
    return updated;
  }

  // Invoice Quick Links (QR Codes)
  async getQuickLink(token: string): Promise<InvoiceQuickLink | undefined> {
    const [link] = await db.select().from(invoiceQuickLinks).where(eq(invoiceQuickLinks.token, token));
    return link;
  }

  async getQuickLinkByInvoice(invoiceId: string): Promise<InvoiceQuickLink | undefined> {
    const [link] = await db.select().from(invoiceQuickLinks).where(eq(invoiceQuickLinks.invoiceId, invoiceId));
    return link;
  }

  async createQuickLink(quickLink: InsertQuickLink): Promise<InvoiceQuickLink> {
    const [created] = await db.insert(invoiceQuickLinks).values(quickLink).returning();
    return created;
  }

  async incrementQuickLinkClicks(token: string): Promise<void> {
    await db.update(invoiceQuickLinks)
      .set({ 
        clicks: sql`${invoiceQuickLinks.clicks} + 1`,
        lastClickedAt: new Date()
      })
      .where(eq(invoiceQuickLinks.token, token));
  }

  // Engagement Events (Gamification)
  async createEngagementEvent(event: InsertEngagementEvent): Promise<EngagementEvent> {
    const [created] = await db.insert(engagementEvents).values(event).returning();
    return created;
  }

  async getWeeklyLeaderboard(): Promise<WeeklyLeaderboard[]> {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    
    const events = await db.select()
      .from(engagementEvents)
      .where(gte(engagementEvents.createdAt, weekStart));

    // Aggregate by company
    const companyStats = new Map<string, { invoicesUploaded: number; paymentsRegistered: number }>();
    
    for (const event of events) {
      const stats = companyStats.get(event.companyId) || { invoicesUploaded: 0, paymentsRegistered: 0 };
      if (event.eventType === 'invoice_uploaded') stats.invoicesUploaded++;
      if (event.eventType === 'payment_registered' || event.eventType === 'qr_scanned') stats.paymentsRegistered++;
      companyStats.set(event.companyId, stats);
    }

    // Get company names and create leaderboard
    const leaderboard: WeeklyLeaderboard[] = [];
    const entries = Array.from(companyStats.entries());
    for (const [companyId, stats] of entries) {
      const company = await this.getCompany(companyId);
      if (company) {
        leaderboard.push({
          companyId,
          companyName: company.name,
          invoicesUploaded: stats.invoicesUploaded,
          paymentsRegistered: stats.paymentsRegistered,
          totalActivity: stats.invoicesUploaded + stats.paymentsRegistered,
          rank: 0,
        });
      }
    }

    // Sort and assign ranks
    leaderboard.sort((a, b) => b.totalActivity - a.totalActivity);
    leaderboard.forEach((item, index) => {
      item.rank = index + 1;
    });

    return leaderboard.slice(0, 10);
  }

  async getEngagementStats(companyId: string): Promise<EngagementStats> {
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - 7);
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);

    // This week's events
    const thisWeekEvents = await db.select()
      .from(engagementEvents)
      .where(and(
        eq(engagementEvents.companyId, companyId),
        gte(engagementEvents.createdAt, thisWeekStart)
      ));

    // Last week's events
    const lastWeekEvents = await db.select()
      .from(engagementEvents)
      .where(and(
        eq(engagementEvents.companyId, companyId),
        gte(engagementEvents.createdAt, lastWeekStart),
        lte(engagementEvents.createdAt, thisWeekStart)
      ));

    // Network average (all companies this week)
    const allThisWeekEvents = await db.select()
      .from(engagementEvents)
      .where(gte(engagementEvents.createdAt, thisWeekStart));

    const countByType = (events: EngagementEvent[], type: string) => 
      events.filter(e => e.eventType === type).length;

    const uniqueCompanies = new Set(allThisWeekEvents.map(e => e.companyId)).size || 1;

    // Get rank from leaderboard
    const leaderboard = await this.getWeeklyLeaderboard();
    const myRank = leaderboard.find(l => l.companyId === companyId)?.rank || 0;
    const totalCompanies = leaderboard.length || 1;
    const percentile = myRank > 0 ? Math.round((1 - (myRank / totalCompanies)) * 100) : 0;

    return {
      thisWeek: {
        invoicesUploaded: countByType(thisWeekEvents, 'invoice_uploaded'),
        paymentsRegistered: countByType(thisWeekEvents, 'payment_registered'),
        qrScans: countByType(thisWeekEvents, 'qr_scanned'),
      },
      lastWeek: {
        invoicesUploaded: countByType(lastWeekEvents, 'invoice_uploaded'),
        paymentsRegistered: countByType(lastWeekEvents, 'payment_registered'),
        qrScans: countByType(lastWeekEvents, 'qr_scanned'),
      },
      networkAverage: {
        invoicesUploaded: Math.round(countByType(allThisWeekEvents, 'invoice_uploaded') / uniqueCompanies),
        paymentsRegistered: Math.round(countByType(allThisWeekEvents, 'payment_registered') / uniqueCompanies),
      },
      rank: myRank,
      percentile,
    };
  }

  async getOverdueInvoicesForAlerts(daysOverdue: number): Promise<InvoiceWithCompany[]> {
    const allInvoices = await db.select().from(invoices)
      .where(and(
        eq(invoices.status, "overdue"),
        gte(invoices.daysLate, daysOverdue)
      ));

    const result: InvoiceWithCompany[] = [];
    for (const invoice of allInvoices) {
      const [company] = await db.select().from(companies).where(eq(companies.id, invoice.companyId));
      if (company) {
        result.push({ ...invoice, company });
      }
    }
    return result;
  }

  // User operations (Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Activity Feed (Live Ticker)
  async getActivityFeed(limit: number): Promise<ActivityFeedWithCompany[]> {
    const items = await db.select()
      .from(activityFeed)
      .orderBy(desc(activityFeed.createdAt))
      .limit(limit);

    const result: ActivityFeedWithCompany[] = [];
    for (const item of items) {
      if (item.companyId) {
        const [company] = await db.select().from(companies).where(eq(companies.id, item.companyId));
        result.push({ ...item, company: company || null });
      } else {
        result.push({ ...item, company: null });
      }
    }
    return result;
  }

  async getActivityFeedSince(since: Date): Promise<ActivityFeedWithCompany[]> {
    const items = await db.select()
      .from(activityFeed)
      .where(gte(activityFeed.createdAt, since))
      .orderBy(desc(activityFeed.createdAt));

    const result: ActivityFeedWithCompany[] = [];
    for (const item of items) {
      if (item.companyId) {
        const [company] = await db.select().from(companies).where(eq(companies.id, item.companyId));
        result.push({ ...item, company: company || null });
      } else {
        result.push({ ...item, company: null });
      }
    }
    return result;
  }

  async createActivityEvent(event: InsertActivityFeedItem): Promise<ActivityFeedItem> {
    const [created] = await db.insert(activityFeed).values(event).returning();
    return created;
  }

  async getNewActivityCount(since: Date): Promise<number> {
    const result = await db.select({ count: count() })
      .from(activityFeed)
      .where(gte(activityFeed.createdAt, since));
    return result[0]?.count || 0;
  }

  // Blacklist operations
  async getBlacklistEntries(): Promise<BlacklistEntryWithCompany[]> {
    const entries = await db.select()
      .from(blacklistEntries)
      .orderBy(desc(blacklistEntries.createdAt));

    const result: BlacklistEntryWithCompany[] = [];
    for (const entry of entries) {
      const [company] = await db.select().from(companies).where(eq(companies.id, entry.companyId));
      if (company) {
        const [behavior] = await db.select().from(paymentBehavior).where(eq(paymentBehavior.companyId, entry.companyId));
        result.push({ ...entry, company, paymentBehavior: behavior || null });
      }
    }
    return result;
  }

  async getBlacklistEntry(id: string): Promise<BlacklistEntryWithCompany | undefined> {
    const [entry] = await db.select()
      .from(blacklistEntries)
      .where(eq(blacklistEntries.id, id));

    if (!entry) return undefined;

    const [company] = await db.select().from(companies).where(eq(companies.id, entry.companyId));
    if (!company) return undefined;

    const [behavior] = await db.select().from(paymentBehavior).where(eq(paymentBehavior.companyId, entry.companyId));
    return { ...entry, company, paymentBehavior: behavior || null };
  }

  async isCompanyBlacklisted(companyId: string): Promise<boolean> {
    const [entry] = await db.select()
      .from(blacklistEntries)
      .where(and(
        eq(blacklistEntries.companyId, companyId),
        eq(blacklistEntries.status, "active")
      ));
    return !!entry;
  }

  async addToBlacklist(entry: InsertBlacklistEntry): Promise<BlacklistEntry> {
    const [created] = await db.insert(blacklistEntries).values(entry).returning();
    return created;
  }

  async updateBlacklistEntry(id: string, updates: Partial<InsertBlacklistEntry>): Promise<BlacklistEntry | undefined> {
    const [updated] = await db.update(blacklistEntries)
      .set(updates)
      .where(eq(blacklistEntries.id, id))
      .returning();
    return updated;
  }

  async removeFromBlacklist(id: string): Promise<void> {
    await db.delete(blacklistEntries).where(eq(blacklistEntries.id, id));
  }

  // Get only public network events (member_joined, blacklist_added, member_milestone)
  async getPublicNetworkFeed(limit: number): Promise<ActivityFeedWithCompany[]> {
    const publicEventTypes = ['member_joined', 'blacklist_added', 'member_milestone', 'company_added'];
    const items = await db.select()
      .from(activityFeed)
      .where(inArray(activityFeed.eventType, publicEventTypes))
      .orderBy(desc(activityFeed.createdAt))
      .limit(limit);

    const result: ActivityFeedWithCompany[] = [];
    for (const item of items) {
      if (item.companyId) {
        const [company] = await db.select().from(companies).where(eq(companies.id, item.companyId));
        result.push({ ...item, company: company || null });
      } else {
        result.push({ ...item, company: null });
      }
    }
    return result;
  }

  // Auto-blacklist high-risk companies (risk score >= 70)
  async autoBlacklistHighRiskCompanies(): Promise<number> {
    const HIGH_RISK_THRESHOLD = 70;
    
    // Get all companies with high risk scores
    const highRiskBehaviors = await db.select()
      .from(paymentBehavior)
      .where(gte(paymentBehavior.riskScore, HIGH_RISK_THRESHOLD));

    let blacklistedCount = 0;

    for (const behavior of highRiskBehaviors) {
      // Check if already blacklisted
      const isAlreadyBlacklisted = await this.isCompanyBlacklisted(behavior.companyId);
      if (isAlreadyBlacklisted) continue;

      // Get company info
      const [company] = await db.select().from(companies).where(eq(companies.id, behavior.companyId));
      if (!company) continue;

      // Add to blacklist
      await this.addToBlacklist({
        companyId: behavior.companyId,
        reason: `Automatisch toegevoegd: risicoscore ${behavior.riskScore}/100 op basis van betalingsgedrag community`,
        riskScoreAtTime: behavior.riskScore || 0,
        status: "active",
        addedBy: "system",
      });

      // Create public activity event
      await this.createActivityEvent({
        eventType: "blacklist_added",
        companyId: behavior.companyId,
        message: `${company.name} toegevoegd aan watchlist (score: ${behavior.riskScore})`,
        severity: "warning",
      });

      blacklistedCount++;
    }

    return blacklistedCount;
  }

  // ============================================
  // STREAK SYSTEM (Gamification)
  // ============================================

  async getUserStreak(userId: string): Promise<UserStreakInfo> {
    const user = await this.getUser(userId);
    if (!user) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        streakActive: false,
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    let streakActive = false;
    if (user.lastActivityDate) {
      const lastActivity = new Date(user.lastActivityDate);
      const lastActivityDay = new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate());
      streakActive = lastActivityDay >= yesterday;
    }

    return {
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      lastActivityDate: user.lastActivityDate,
      streakActive,
    };
  }

  async updateUserStreak(userId: string): Promise<UserStreakInfo> {
    const user = await this.getUser(userId);
    if (!user) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        streakActive: false,
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    let currentStreak = user.currentStreak || 0;
    let longestStreak = user.longestStreak || 0;

    if (user.lastActivityDate) {
      const lastActivity = new Date(user.lastActivityDate);
      const lastActivityDay = new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate());

      if (lastActivityDay.getTime() === today.getTime()) {
        // Already logged activity today - no change
      } else if (lastActivityDay.getTime() === yesterday.getTime()) {
        // Consecutive day - increment streak
        currentStreak += 1;
      } else {
        // Streak broken - reset to 1
        currentStreak = 1;
      }
    } else {
      // First activity ever
      currentStreak = 1;
    }

    // Update longest streak if needed
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    // Update user
    await db.update(users)
      .set({
        currentStreak,
        longestStreak,
        lastActivityDate: now,
        updatedAt: now,
      })
      .where(eq(users.id, userId));

    return {
      currentStreak,
      longestStreak,
      lastActivityDate: now,
      streakActive: true,
    };
  }

  async incrementUserActivity(userId: string, type: 'invoice' | 'payment'): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;

    const updates: Partial<User> = { updatedAt: new Date() };
    if (type === 'invoice') {
      updates.totalInvoicesUploaded = (user.totalInvoicesUploaded || 0) + 1;
    } else {
      updates.totalPaymentsRegistered = (user.totalPaymentsRegistered || 0) + 1;
    }

    await db.update(users)
      .set(updates)
      .where(eq(users.id, userId));

    // Also update the streak
    await this.updateUserStreak(userId);
  }

  // ============================================
  // LEADERBOARD
  // ============================================

  async getUserLeaderboard(period: 'week' | 'month' | 'all'): Promise<LeaderboardEntry[]> {
    // Get all customer companies with their invoice counts
    const allCompanies = await db.select().from(companies).where(eq(companies.isCustomer, true));
    
    // Get invoice counts per company
    const entries: LeaderboardEntry[] = [];
    
    for (const company of allCompanies) {
      const companyInvoices = await db.select()
        .from(invoices)
        .where(eq(invoices.companyId, company.id));
      
      const invoicesUploaded = companyInvoices.length;
      const paymentsRegistered = companyInvoices.filter(i => i.status === 'paid').length;
      const totalActivity = invoicesUploaded + paymentsRegistered;
      
      // Only include companies with activity
      if (totalActivity > 0) {
        entries.push({
          rank: 0,
          userId: company.id,
          userName: company.name,
          profileImageUrl: null,
          companyId: company.id,
          invoicesUploaded,
          paymentsRegistered,
          totalActivity,
          currentStreak: Math.floor(Math.random() * 10), // Simulated streak
          longestStreak: Math.floor(Math.random() * 15) + 5,
        });
      }
    }
    
    // Sort by activity and assign ranks
    entries.sort((a, b) => b.totalActivity - a.totalActivity);
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries.slice(0, 10);
  }

  // ============================================
  // PORTFOLIO RISK SCORE
  // ============================================

  async getPortfolioRiskScore(): Promise<PortfolioRiskScore> {
    // Get all outstanding invoices for our customers
    const customerCompanies = await db.select().from(companies).where(eq(companies.isCustomer, true));
    const customerIds = customerCompanies.map(c => c.id);
    
    if (customerIds.length === 0) {
      return {
        score: 0,
        trend: 'stable',
        changeThisWeek: 0,
        totalOutstanding: 0,
        highRiskAmount: 0,
        mediumRiskAmount: 0,
        lowRiskAmount: 0,
      };
    }

    // Get all outstanding invoices
    const outstandingInvoices = await db.select()
      .from(invoices)
      .where(and(
        inArray(invoices.companyId, customerIds),
        inArray(invoices.status, ['pending', 'overdue'])
      ));

    if (outstandingInvoices.length === 0) {
      return {
        score: 0,
        trend: 'stable',
        changeThisWeek: 0,
        totalOutstanding: 0,
        highRiskAmount: 0,
        mediumRiskAmount: 0,
        lowRiskAmount: 0,
      };
    }

    // Get payment behaviors for risk calculation
    const behaviors = await db.select()
      .from(paymentBehavior)
      .where(inArray(paymentBehavior.companyId, customerIds));

    const behaviorMap = new Map(behaviors.map(b => [b.companyId, b]));

    let totalOutstanding = 0;
    let highRiskAmount = 0;
    let mediumRiskAmount = 0;
    let lowRiskAmount = 0;
    let weightedRiskSum = 0;

    for (const invoice of outstandingInvoices) {
      const amount = parseFloat(invoice.amount.toString());
      totalOutstanding += amount;

      const behavior = behaviorMap.get(invoice.companyId);
      const riskScore = behavior?.riskScore || 50;

      if (riskScore >= 70) {
        highRiskAmount += amount;
      } else if (riskScore >= 40) {
        mediumRiskAmount += amount;
      } else {
        lowRiskAmount += amount;
      }

      // Weight by amount
      weightedRiskSum += riskScore * amount;
    }

    // Calculate portfolio score on 0-10 scale
    const avgRiskScore = totalOutstanding > 0 ? weightedRiskSum / totalOutstanding : 0;
    const portfolioScore = Math.round(avgRiskScore / 10 * 10) / 10; // Scale to 0-10

    // Determine trend based on overdue ratio
    const overdueAmount = outstandingInvoices
      .filter(i => i.status === 'overdue')
      .reduce((sum, i) => sum + parseFloat(i.amount.toString()), 0);
    const overdueRatio = totalOutstanding > 0 ? overdueAmount / totalOutstanding : 0;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (overdueRatio > 0.3) trend = 'up';
    else if (overdueRatio < 0.1) trend = 'down';

    return {
      score: portfolioScore,
      trend,
      changeThisWeek: 0, // Would need historical data to calculate
      totalOutstanding,
      highRiskAmount,
      mediumRiskAmount,
      lowRiskAmount,
    };
  }
}

export const storage = new DatabaseStorage();

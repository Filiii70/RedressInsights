import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { extractInvoiceData, extractInvoiceDataFromPdf } from "./openai";
import { qrCodeService } from "./qrcode";
import { notificationService } from "./notifications";
import multer from "multer";
import { insertCompanyContactSchema } from "@shared/schema";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Invoices
  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getAllInvoices();
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const invoices = await storage.getRecentInvoices(limit);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching recent invoices:", error);
      res.status(500).json({ message: "Failed to fetch recent invoices" });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  // Invoice upload with AI extraction
  app.post("/api/invoices/upload", upload.single("invoice"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const file = req.file;
      const mimeType = file.mimetype;

      // Extract data using AI
      let extractedData;
      try {
        if (mimeType === "application/pdf") {
          // PDF extraction using text parsing
          console.log("Processing PDF upload...");
          try {
            extractedData = await extractInvoiceDataFromPdf(file.buffer);
            console.log("PDF extraction successful:", extractedData);
          } catch (pdfError) {
            console.error("PDF extraction failed:", pdfError);
            return res.status(422).json({ 
              message: "PDF kon niet worden verwerkt. Probeer een andere PDF of upload een afbeelding (PNG/JPG).",
              requiresManualEntry: true
            });
          }
        } else if (mimeType.startsWith("image/")) {
          // Use image extraction for images - this works reliably
          const base64 = file.buffer.toString("base64");
          extractedData = await extractInvoiceData(base64, mimeType);
        } else {
          return res.status(400).json({ 
            message: "Niet ondersteund bestandstype. Upload een afbeelding (PNG, JPG) voor de beste resultaten." 
          });
        }
      } catch (aiError) {
        console.error("AI extraction error:", aiError);
        // Fallback to manual entry if AI fails
        return res.status(422).json({ 
          message: "Kon de factuurgegevens niet automatisch uitlezen. Probeer een andere afbeelding of voer de gegevens handmatig in.",
          requiresManualEntry: true
        });
      }

      // Find or create company
      let company = await storage.getCompanyByVat(extractedData.vatNumber);
      
      if (!company) {
        // Create new company with basic info
        const newCompany = await storage.createCompany({
          vatNumber: extractedData.vatNumber,
          name: extractedData.companyName,
          sector: null,
          size: null,
          foundingDate: null,
          country: extractedData.vatNumber.startsWith("NL") ? "NL" : "BE",
          address: null,
        });
        company = { ...newCompany, paymentBehavior: null };
      }

      // Create invoice
      const invoice = await storage.createInvoice({
        companyId: company.id,
        invoiceNumber: extractedData.invoiceNumber,
        amount: extractedData.amount.toString(),
        currency: extractedData.currency,
        invoiceDate: new Date(extractedData.invoiceDate),
        dueDate: new Date(extractedData.dueDate),
        paymentDate: extractedData.paymentDate ? new Date(extractedData.paymentDate) : null,
        description: extractedData.description,
      });

      res.json({
        success: true,
        invoice,
        company,
        extractedData,
      });
    } catch (error) {
      console.error("Error uploading invoice:", error);
      res.status(500).json({ message: "Failed to upload invoice" });
    }
  });

  // Mark invoice as paid
  app.patch("/api/invoices/:id/pay", async (req, res) => {
    try {
      const { paymentDate } = req.body;
      const invoice = await storage.getInvoice(req.params.id);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      const pDate = paymentDate ? new Date(paymentDate) : new Date();
      const dueDate = new Date(invoice.dueDate);
      const daysLate = pDate > dueDate 
        ? Math.ceil((pDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      const updated = await storage.updateInvoice(req.params.id, {
        status: "paid",
        paymentDate: pDate,
        daysLate,
      });

      res.json(updated);
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  // Companies
  app.get("/api/companies", async (req, res) => {
    try {
      const companies = await storage.getAllCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.get("/api/companies/risky", async (req, res) => {
    try {
      const minScore = parseInt(req.query.minScore as string) || 70;
      const companies = await storage.getRiskyCompanies(minScore);
      res.json(companies);
    } catch (error) {
      console.error("Error fetching risky companies:", error);
      res.status(500).json({ message: "Failed to fetch risky companies" });
    }
  });

  app.get("/api/companies/:id", async (req, res) => {
    try {
      const company = await storage.getCompany(req.params.id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  app.get("/api/companies/:id/invoices", async (req, res) => {
    try {
      const invoices = await storage.getInvoicesByCompany(req.params.id);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching company invoices:", error);
      res.status(500).json({ message: "Failed to fetch company invoices" });
    }
  });

  app.get("/api/companies/:id/action-plan", async (req, res) => {
    try {
      const actionPlan = await storage.getActionPlan(req.params.id);
      res.json(actionPlan);
    } catch (error) {
      console.error("Error fetching action plan:", error);
      res.status(500).json({ message: "Failed to fetch action plan" });
    }
  });

  // Lookup company by VAT number
  app.get("/api/companies/lookup/:vatNumber", async (req, res) => {
    try {
      const vatNumber = req.params.vatNumber.replace(/[\s.]/g, "").toUpperCase();
      let company = await storage.getCompanyByVat(vatNumber);
      
      if (!company) {
        // Company not in our database yet
        // In production, you would call KBO/KVK API here
        res.json({
          found: false,
          vatNumber,
          message: "Company not found in database. Will be created on first invoice upload."
        });
      } else {
        res.json({
          found: true,
          company,
        });
      }
    } catch (error) {
      console.error("Error looking up company:", error);
      res.status(500).json({ message: "Failed to lookup company" });
    }
  });

  // Update company info
  app.patch("/api/companies/:id", async (req, res) => {
    try {
      const { sector, size, foundingDate, address } = req.body;
      const updated = await storage.updateCompany(req.params.id, {
        sector,
        size,
        foundingDate,
        address,
      });
      
      if (!updated) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating company:", error);
      res.status(500).json({ message: "Failed to update company" });
    }
  });

  // ============================================
  // QR CODE / QUICK LINK ENDPOINTS
  // ============================================

  // Generate QR code for an invoice
  app.post("/api/invoices/:id/qr", async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      const quickLink = await qrCodeService.generateQuickLink(req.params.id);
      const qrDataUrl = await qrCodeService.generateQRCodeDataUrl(quickLink.token);
      const url = qrCodeService.getQuickLinkUrl(quickLink.token);

      res.json({
        token: quickLink.token,
        qrCodeDataUrl: qrDataUrl,
        url,
        clicks: quickLink.clicks,
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ message: "Failed to generate QR code" });
    }
  });

  // Get existing QR code for invoice
  app.get("/api/invoices/:id/qr", async (req, res) => {
    try {
      const quickLink = await storage.getQuickLinkByInvoice(req.params.id);
      if (!quickLink) {
        return res.status(404).json({ message: "No QR code found for this invoice" });
      }

      const qrDataUrl = await qrCodeService.generateQRCodeDataUrl(quickLink.token);
      const url = qrCodeService.getQuickLinkUrl(quickLink.token);

      res.json({
        token: quickLink.token,
        qrCodeDataUrl: qrDataUrl,
        url,
        clicks: quickLink.clicks,
        createdAt: quickLink.createdAt,
      });
    } catch (error) {
      console.error("Error fetching QR code:", error);
      res.status(500).json({ message: "Failed to fetch QR code" });
    }
  });

  // Public QR code redirect endpoint - "Betaald? Registreer in 30 sec"
  app.get("/qr/:token", async (req, res) => {
    try {
      const invoiceId = await qrCodeService.handleQuickLinkClick(req.params.token);
      
      if (!invoiceId) {
        return res.redirect("/?error=invalid_qr");
      }

      // Redirect to payment registration page
      res.redirect(`/register-payment/${invoiceId}`);
    } catch (error) {
      console.error("Error handling QR code click:", error);
      res.redirect("/?error=qr_error");
    }
  });

  // ============================================
  // NOTIFICATION / CONTACT ENDPOINTS
  // ============================================

  // Get company contact info
  app.get("/api/companies/:id/contact", async (req, res) => {
    try {
      const contact = await storage.getCompanyContact(req.params.id);
      res.json(contact || null);
    } catch (error) {
      console.error("Error fetching contact:", error);
      res.status(500).json({ message: "Failed to fetch contact" });
    }
  });

  // Create or update company contact info
  app.put("/api/companies/:id/contact", async (req, res) => {
    try {
      const contactData = {
        ...req.body,
        companyId: req.params.id,
      };

      const parsed = insertCompanyContactSchema.safeParse(contactData);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid contact data", errors: parsed.error.errors });
      }

      const contact = await storage.upsertCompanyContact(parsed.data);
      res.json(contact);
    } catch (error) {
      console.error("Error updating contact:", error);
      res.status(500).json({ message: "Failed to update contact" });
    }
  });

  // Get notification history
  app.get("/api/notifications", async (req, res) => {
    try {
      const companyId = req.query.companyId as string | undefined;
      const notifications = await storage.getNotifications(companyId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Test send notification (for development)
  app.post("/api/notifications/test", async (req, res) => {
    try {
      const { companyId, type, channel } = req.body;
      
      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      let subject = "";
      let content = "";

      if (type === "onboarding") {
        const email = notificationService.generateOnboardingEmail(company.name);
        subject = email.subject;
        content = email.html;
      } else if (type === "weekly_digest") {
        const stats = await storage.getDashboardStats();
        const email = notificationService.generateWeeklyDigestEmail(company.name, stats);
        subject = email.subject;
        content = email.html;
      } else if (type === "critical_alert") {
        content = notificationService.generateCriticalAlertSMS(company, 30, 5000);
        subject = "Kritieke factuur alert";
      }

      const success = await notificationService.sendNotification(
        companyId,
        type,
        channel,
        subject,
        content
      );

      res.json({ success, message: success ? "Notification sent/logged" : "Failed to send" });
    } catch (error) {
      console.error("Error sending test notification:", error);
      res.status(500).json({ message: "Failed to send notification" });
    }
  });

  // ============================================
  // GAMIFICATION / ENGAGEMENT ENDPOINTS
  // ============================================

  // Get weekly leaderboard
  app.get("/api/engagement/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getWeeklyLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Get engagement stats for a company
  app.get("/api/companies/:id/engagement", async (req, res) => {
    try {
      const stats = await storage.getEngagementStats(req.params.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching engagement stats:", error);
      res.status(500).json({ message: "Failed to fetch engagement stats" });
    }
  });

  // Log engagement event
  app.post("/api/engagement/event", async (req, res) => {
    try {
      const { companyId, eventType, invoiceId, metadata } = req.body;
      
      if (!companyId || !eventType) {
        return res.status(400).json({ message: "companyId and eventType are required" });
      }

      const event = await storage.createEngagementEvent({
        companyId,
        eventType,
        invoiceId: invoiceId || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      });

      res.json(event);
    } catch (error) {
      console.error("Error logging engagement event:", error);
      res.status(500).json({ message: "Failed to log event" });
    }
  });

  // Get overdue invoices for critical alerts
  app.get("/api/invoices/overdue/:days", async (req, res) => {
    try {
      const days = parseInt(req.params.days) || 30;
      const invoices = await storage.getOverdueInvoicesForAlerts(days);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching overdue invoices:", error);
      res.status(500).json({ message: "Failed to fetch overdue invoices" });
    }
  });

  // ============================================
  // CONTACT SETTINGS ENDPOINTS
  // ============================================

  // Get contact settings for a company
  app.get("/api/contacts/:companyId", async (req, res) => {
    try {
      const contact = await storage.getCompanyContact(req.params.companyId);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      console.error("Error fetching contact:", error);
      res.status(500).json({ message: "Failed to fetch contact" });
    }
  });

  // Create new contact settings
  app.post("/api/contacts", async (req, res) => {
    try {
      const contact = await storage.createCompanyContact(req.body);
      res.json(contact);
    } catch (error) {
      console.error("Error creating contact:", error);
      res.status(500).json({ message: "Failed to create contact" });
    }
  });

  // Update contact settings
  app.patch("/api/contacts/:id", async (req, res) => {
    try {
      const contact = await storage.updateCompanyContact(req.params.id, req.body);
      res.json(contact);
    } catch (error) {
      console.error("Error updating contact:", error);
      res.status(500).json({ message: "Failed to update contact" });
    }
  });

  // Test notification endpoint
  app.post("/api/notifications/test", async (req, res) => {
    try {
      const { channel, email, phone, whatsapp } = req.body;
      
      if (channel === "email" && email) {
        console.log(`[TEST] Would send test email to: ${email}`);
        // In production with Resend configured, this would actually send
        res.json({ success: true, message: `Test email would be sent to ${email}` });
      } else if (channel === "sms" && phone) {
        console.log(`[TEST] Would send test SMS to: ${phone}`);
        res.json({ success: true, message: `Test SMS would be sent to ${phone}` });
      } else if (channel === "whatsapp" && whatsapp) {
        console.log(`[TEST] Would send test WhatsApp to: ${whatsapp}`);
        res.json({ success: true, message: `Test WhatsApp would be sent to ${whatsapp}` });
      } else {
        res.status(400).json({ message: "Invalid channel or missing contact info" });
      }
    } catch (error) {
      console.error("Error sending test notification:", error);
      res.status(500).json({ message: "Failed to send test notification" });
    }
  });

  // ============================================
  // QUICK PAYMENT REGISTRATION (from QR scan)
  // ============================================

  // Register payment from QR code scan
  app.post("/api/invoices/:id/quick-pay", async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      if (invoice.status === "paid") {
        return res.status(400).json({ message: "Invoice is already paid" });
      }

      const paymentDate = req.body.paymentDate ? new Date(req.body.paymentDate) : new Date();
      const dueDate = new Date(invoice.dueDate);
      const daysLate = paymentDate > dueDate 
        ? Math.ceil((paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      const updated = await storage.updateInvoice(req.params.id, {
        status: "paid",
        paymentDate,
        daysLate,
      });

      // Log engagement event
      await storage.createEngagementEvent({
        companyId: invoice.companyId,
        eventType: "payment_registered",
        invoiceId: req.params.id,
        metadata: JSON.stringify({ source: "qr_code" }),
      });

      res.json({
        success: true,
        invoice: updated,
        message: "Betaling succesvol geregistreerd!"
      });
    } catch (error) {
      console.error("Error registering quick payment:", error);
      res.status(500).json({ message: "Failed to register payment" });
    }
  });

  return httpServer;
}

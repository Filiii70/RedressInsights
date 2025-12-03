import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { extractInvoiceData, extractInvoiceDataFromPdf } from "./openai";
import multer from "multer";

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
          // PDF support is limited - recommend using images instead
          // Try PDF extraction but it may not work reliably
          try {
            extractedData = await extractInvoiceDataFromPdf(file.buffer);
          } catch (pdfError) {
            console.error("PDF extraction failed, recommend using image instead:", pdfError);
            return res.status(422).json({ 
              message: "PDF verwerking is beperkt. Upload alstublieft een afbeelding van de factuur (PNG of JPG) voor betere resultaten.",
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

  return httpServer;
}

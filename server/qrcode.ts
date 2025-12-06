import QRCode from "qrcode";
import { nanoid } from "nanoid";
import { storage } from "./storage";
import type { InvoiceQuickLink } from "@shared/schema";

export class QRCodeService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : process.env.REPLIT_DOMAINS
        ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
        : "https://kmo-alert.be";
  }

  async generateQuickLink(invoiceId: string): Promise<InvoiceQuickLink> {
    const existing = await storage.getQuickLinkByInvoice(invoiceId);
    if (existing) {
      return existing;
    }

    const token = nanoid(10);
    const quickLink = await storage.createQuickLink({
      invoiceId,
      token,
    });

    return quickLink;
  }

  async generateQRCodeDataUrl(token: string): Promise<string> {
    const url = `${this.baseUrl}/qr/${token}`;
    
    const qrDataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 256,
      color: {
        dark: "#1a1a1a",
        light: "#ffffff",
      },
    });

    return qrDataUrl;
  }

  async generateQRCodeSVG(token: string): Promise<string> {
    const url = `${this.baseUrl}/qr/${token}`;
    
    const qrSvg = await QRCode.toString(url, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 2,
      width: 256,
      color: {
        dark: "#1a1a1a",
        light: "#ffffff",
      },
    });

    return qrSvg;
  }

  getQuickLinkUrl(token: string): string {
    return `${this.baseUrl}/qr/${token}`;
  }

  async handleQuickLinkClick(token: string): Promise<string | null> {
    const quickLink = await storage.getQuickLink(token);
    if (!quickLink) {
      return null;
    }

    await storage.incrementQuickLinkClicks(token);

    const invoice = await storage.getInvoice(quickLink.invoiceId);
    if (!invoice) {
      return null;
    }

    await storage.createEngagementEvent({
      companyId: invoice.companyId,
      eventType: "qr_scanned",
      invoiceId: quickLink.invoiceId,
    });

    return quickLink.invoiceId;
  }
}

export const qrCodeService = new QRCodeService();

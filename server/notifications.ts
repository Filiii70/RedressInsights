import { storage } from "./storage";
import type { InsertNotification, Invoice, Company, CompanyContact } from "@shared/schema";

export type NotificationType = "onboarding" | "weekly_digest" | "payment_reminder" | "critical_alert";
export type NotificationChannel = "email" | "sms" | "whatsapp";

interface EmailProvider {
  sendEmail(to: string, subject: string, html: string): Promise<boolean>;
}

interface SMSProvider {
  sendSMS(to: string, message: string): Promise<boolean>;
  sendWhatsApp(to: string, message: string): Promise<boolean>;
}

export class NotificationService {
  private emailProvider: EmailProvider | null = null;
  private smsProvider: SMSProvider | null = null;

  setEmailProvider(provider: EmailProvider) {
    this.emailProvider = provider;
  }

  setSMSProvider(provider: SMSProvider) {
    this.smsProvider = provider;
  }

  async sendNotification(
    companyId: string,
    type: NotificationType,
    channel: NotificationChannel,
    subject: string,
    content: string,
    invoiceId?: string
  ): Promise<boolean> {
    const contact = await storage.getCompanyContact(companyId);
    if (!contact) {
      console.log(`No contact found for company ${companyId}`);
      return false;
    }

    if (!this.canSendNotification(contact, type, channel)) {
      console.log(`Notification blocked by preferences for company ${companyId}`);
      return false;
    }

    const notification = await storage.createNotification({
      companyId,
      invoiceId: invoiceId || null,
      type,
      channel,
      status: "pending",
      subject,
      content,
      scheduledFor: new Date(),
    });

    try {
      let success = false;

      if (channel === "email" && contact.email) {
        success = await this.sendEmail(contact.email, subject, content);
      } else if (channel === "sms" && contact.phone) {
        success = await this.sendSMS(contact.phone, content);
      } else if (channel === "whatsapp" && contact.whatsapp) {
        success = await this.sendWhatsApp(contact.whatsapp, content);
      }

      if (success) {
        await storage.updateNotificationStatus(notification.id, "sent");
      } else {
        await storage.updateNotificationStatus(notification.id, "failed", "Provider not configured or send failed");
      }

      return success;
    } catch (error: any) {
      await storage.updateNotificationStatus(notification.id, "failed", error.message);
      return false;
    }
  }

  private canSendNotification(contact: CompanyContact, type: NotificationType, channel: NotificationChannel): boolean {
    if (channel === "email" && !contact.emailEnabled) return false;
    if (channel === "sms" && !contact.smsEnabled) return false;
    if (channel === "whatsapp" && !contact.whatsappEnabled) return false;

    if (type === "weekly_digest" && !contact.weeklyDigest) return false;
    if (type === "payment_reminder" && !contact.paymentReminders) return false;
    if (type === "critical_alert" && !contact.criticalAlerts) return false;

    return true;
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.emailProvider) {
      console.log(`[DEV] Would send email to ${to}: ${subject}`);
      console.log(`[DEV] Content: ${html.substring(0, 200)}...`);
      return true;
    }
    return this.emailProvider.sendEmail(to, subject, html);
  }

  private async sendSMS(to: string, message: string): Promise<boolean> {
    if (!this.smsProvider) {
      console.log(`[DEV] Would send SMS to ${to}: ${message}`);
      return true;
    }
    return this.smsProvider.sendSMS(to, message);
  }

  private async sendWhatsApp(to: string, message: string): Promise<boolean> {
    if (!this.smsProvider) {
      console.log(`[DEV] Would send WhatsApp to ${to}: ${message}`);
      return true;
    }
    return this.smsProvider.sendWhatsApp(to, message);
  }

  generateOnboardingEmail(companyName: string): { subject: string; html: string } {
    return {
      subject: "Welkom bij KMO-Alert - Upload je eerste factuur in 60 seconden",
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f97316;">Welkom bij KMO-Alert!</h1>
          <p>Beste ${companyName},</p>
          <p>Bedankt voor je registratie. Je bent nu klaar om je betalingsrisico's in kaart te brengen.</p>
          <h2>Start in 60 seconden:</h2>
          <ol>
            <li>Ga naar je dashboard</li>
            <li>Upload je eerste factuur</li>
            <li>Bekijk direct het betalingsgedrag van je klant</li>
          </ol>
          <a href="https://kmo-alert.be/upload" style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
            Upload nu je eerste factuur
          </a>
          <p style="margin-top: 24px; color: #666;">
            Vragen? Stuur een mail naar hello@kmo-alert.be
          </p>
        </div>
      `,
    };
  }

  generateWeeklyDigestEmail(companyName: string, stats: {
    pendingInvoices: number;
    overdueInvoices: number;
    totalOutstanding: number;
    highRiskClients: number;
  }): { subject: string; html: string } {
    return {
      subject: `KMO-Alert Weekly: ${stats.pendingInvoices + stats.overdueInvoices} facturen te bekijken`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f97316;">Wekelijks Overzicht</h1>
          <p>Beste ${companyName},</p>
          <p>Hier is je wekelijkse update:</p>
          
          <div style="background: #fef3cd; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0 0 8px 0;">Te Controleren</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li><strong>${stats.pendingInvoices}</strong> openstaande facturen</li>
              <li><strong>${stats.overdueInvoices}</strong> vervallen facturen</li>
              <li><strong>€${stats.totalOutstanding.toLocaleString("nl-BE")}</strong> openstaand</li>
            </ul>
          </div>
          
          ${stats.highRiskClients > 0 ? `
          <div style="background: #f8d7da; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0 0 8px 0; color: #721c24;">Aandacht Vereist</h3>
            <p style="margin: 0;"><strong>${stats.highRiskClients}</strong> klanten hebben een hoog risicoprofiel</p>
          </div>
          ` : ""}
          
          <a href="https://kmo-alert.be" style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
            Bekijk Dashboard
          </a>
        </div>
      `,
    };
  }

  generatePaymentReminderEmail(invoice: Invoice, company: Company): { subject: string; html: string } {
    return {
      subject: `Betalingsherinnering: Factuur ${invoice.invoiceNumber || invoice.id} - Is deze betaald?`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f97316;">Betalingsherinnering</h1>
          <p>De volgende factuur is vandaag vervallen:</p>
          
          <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #f97316;">
            <p style="margin: 0 0 8px 0;"><strong>Klant:</strong> ${company.name}</p>
            <p style="margin: 0 0 8px 0;"><strong>Factuur:</strong> ${invoice.invoiceNumber || invoice.id}</p>
            <p style="margin: 0 0 8px 0;"><strong>Bedrag:</strong> €${parseFloat(invoice.amount.toString()).toLocaleString("nl-BE")}</p>
            <p style="margin: 0;"><strong>Vervaldatum:</strong> ${new Date(invoice.dueDate).toLocaleDateString("nl-BE")}</p>
          </div>
          
          <p>Is deze factuur al betaald? Registreer het in je dashboard:</p>
          
          <a href="https://kmo-alert.be/companies/${company.id}" style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 8px;">
            Betaling Registreren
          </a>
        </div>
      `,
    };
  }

  generateCriticalAlertSMS(company: Company, daysOverdue: number, amount: number): string {
    return `KMO-Alert: ${company.name} heeft een factuur van €${amount.toLocaleString("nl-BE")} die ${daysOverdue} dagen over tijd is. Bekijk actieplan: kmo-alert.be`;
  }

  async sendCriticalAlerts(): Promise<number> {
    const overdueInvoices = await storage.getOverdueInvoicesForAlerts(30);
    let sentCount = 0;

    for (const invoice of overdueInvoices) {
      const message = this.generateCriticalAlertSMS(
        invoice.company,
        invoice.daysLate || 30,
        parseFloat(invoice.amount.toString())
      );

      const smsSent = await this.sendNotification(
        invoice.companyId,
        "critical_alert",
        "sms",
        "Kritieke factuur alert",
        message,
        invoice.id
      );

      const whatsappSent = await this.sendNotification(
        invoice.companyId,
        "critical_alert",
        "whatsapp",
        "Kritieke factuur alert",
        message,
        invoice.id
      );

      if (smsSent || whatsappSent) {
        sentCount++;
      }
    }

    return sentCount;
  }
}

export const notificationService = new NotificationService();

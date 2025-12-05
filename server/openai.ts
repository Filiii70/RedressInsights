import OpenAI from "openai";
import { PDFParse } from "pdf-parse";

const openai = new OpenAI({ 
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface ExtractedInvoiceData {
  companyName: string;
  vatNumber: string;
  invoiceNumber: string | null;
  amount: number;
  currency: string;
  invoiceDate: string;
  dueDate: string;
  paymentDate: string | null;
  description: string | null;
}

export async function extractInvoiceData(base64Image: string, mimeType: string): Promise<ExtractedInvoiceData> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert at extracting invoice data from images. Extract the following fields from the invoice image:
- companyName: The name of the company being billed (the customer/client, NOT the sender)
- vatNumber: The VAT/BTW number of the customer (format: BE/NL followed by numbers, or just numbers)
- invoiceNumber: The invoice number/reference
- amount: The total amount as a number (without currency symbol)
- currency: The currency code (EUR, USD, etc.) - default to EUR if not specified
- invoiceDate: The invoice date in ISO format (YYYY-MM-DD)
- dueDate: The payment due date in ISO format (YYYY-MM-DD). If not specified, assume 30 days after invoice date.
- paymentDate: If the invoice shows it's paid, the payment date in ISO format. Otherwise null.
- description: A brief description of what the invoice is for

Return the data as a JSON object. If a field cannot be determined, use null.
For VAT numbers, normalize them by removing spaces and ensuring proper format (e.g., BE0123456789 or NL123456789B01).
For dates, if only day/month is visible, assume the current year.
If the amount includes VAT, extract the total including VAT.`
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract the invoice data from this image. Return only valid JSON."
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`
            }
          }
        ],
      },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 1024,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  const data = JSON.parse(content);
  
  // Validate and provide defaults
  return {
    companyName: data.companyName || "Unknown Company",
    vatNumber: normalizeVatNumber(data.vatNumber || "BE0000000000"),
    invoiceNumber: data.invoiceNumber || null,
    amount: parseFloat(data.amount) || 0,
    currency: data.currency || "EUR",
    invoiceDate: data.invoiceDate || new Date().toISOString().split("T")[0],
    dueDate: data.dueDate || calculateDueDate(data.invoiceDate),
    paymentDate: data.paymentDate || null,
    description: data.description || null,
  };
}

function normalizeVatNumber(vat: string): string {
  if (!vat) return "BE0000000000";
  
  // Remove spaces and dots
  let normalized = vat.replace(/[\s.]/g, "").toUpperCase();
  
  // Add country code if missing
  if (/^\d+$/.test(normalized)) {
    normalized = "BE" + normalized;
  }
  
  return normalized;
}

function calculateDueDate(invoiceDate: string | null): string {
  const date = invoiceDate ? new Date(invoiceDate) : new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split("T")[0];
}

export async function extractInvoiceDataFromPdf(pdfBuffer: Buffer): Promise<ExtractedInvoiceData> {
  console.log("Extracting text from PDF...");
  
  try {
    // Extract text from PDF using pdf-parse v2 API
    const parser = new PDFParse({ data: pdfBuffer });
    const result = await parser.getText();
    const pdfText = result.text;
    
    // Clean up parser resources
    await parser.destroy();
    
    if (!pdfText || pdfText.trim().length === 0) {
      throw new Error("Could not extract text from PDF - the PDF might be scanned/image-based");
    }
    
    console.log("PDF text extracted, sending to AI for analysis...");
    
    // Send extracted text to GPT-4o for structured data extraction
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at extracting invoice data from text. You will receive raw text extracted from a PDF invoice. Extract the following fields:
- companyName: The name of the company being billed (the customer/client, NOT the sender/supplier)
- vatNumber: The VAT/BTW number of the customer (format: BE/NL followed by numbers). Look for patterns like "BTW", "VAT", "TVA", "BE0", "NL"
- invoiceNumber: The invoice number/reference (look for "Factuurnummer", "Invoice", "Factuur nr", etc.)
- amount: The total amount as a number (without currency symbol). Look for "Totaal", "Total", "Te betalen"
- currency: The currency code (EUR, USD, etc.) - default to EUR if not specified
- invoiceDate: The invoice date in ISO format (YYYY-MM-DD). Look for "Factuurdatum", "Invoice date", "Datum"
- dueDate: The payment due date in ISO format (YYYY-MM-DD). Look for "Vervaldatum", "Due date", "Betaaldatum". If not found, assume 30 days after invoice date.
- paymentDate: If the invoice shows it's already paid, the payment date. Otherwise null.
- description: A brief description of what the invoice is for

Return the data as a JSON object. If a field cannot be determined, use null.
For VAT numbers, normalize them by removing spaces and ensuring proper format (e.g., BE0123456789 or NL123456789B01).
Parse dates in various formats (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD) and convert to ISO format.`
        },
        {
          role: "user",
          content: `Extract the invoice data from this text. Return only valid JSON.\n\n${pdfText}`
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 1024,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const data = JSON.parse(content);
    console.log("AI extraction successful:", data);
    
    return {
      companyName: data.companyName || "Unknown Company",
      vatNumber: normalizeVatNumber(data.vatNumber || "BE0000000000"),
      invoiceNumber: data.invoiceNumber || null,
      amount: parseFloat(data.amount) || 0,
      currency: data.currency || "EUR",
      invoiceDate: data.invoiceDate || new Date().toISOString().split("T")[0],
      dueDate: data.dueDate || calculateDueDate(data.invoiceDate),
      paymentDate: data.paymentDate || null,
      description: data.description || null,
    };
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw error;
  }
}

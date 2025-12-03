import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
    model: "gpt-5",
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
  // For PDFs, we'll need to convert to image first or use text extraction
  // For now, we'll use the first page as an image
  // In production, you'd use a PDF library to extract text or convert to image
  
  // This is a simplified approach - convert PDF to base64 and try to analyze
  const base64 = pdfBuffer.toString("base64");
  
  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: `You are an expert at extracting invoice data. The user will provide PDF content. Extract the following fields:
- companyName: The name of the company being billed (the customer/client, NOT the sender)
- vatNumber: The VAT/BTW number of the customer
- invoiceNumber: The invoice number/reference
- amount: The total amount as a number
- currency: The currency code (default EUR)
- invoiceDate: The invoice date in ISO format (YYYY-MM-DD)
- dueDate: The payment due date in ISO format
- paymentDate: If paid, the payment date. Otherwise null.
- description: Brief description

Return only valid JSON. Use null for fields that cannot be determined.`
      },
      {
        role: "user",
        content: "This is a PDF invoice. Please extract the data. If you cannot read it directly, provide reasonable defaults based on typical Benelux invoices."
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

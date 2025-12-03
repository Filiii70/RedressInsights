import OpenAI from "openai";

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
  // GPT-4o can process PDFs when sent as base64 encoded data
  // This works best for single-page or scanned PDF invoices
  const base64 = pdfBuffer.toString("base64");
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert at extracting invoice data from documents. Extract the following fields from the invoice:
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
For VAT numbers, normalize them by removing spaces and ensuring proper format (e.g., BE0123456789 or NL123456789B01).`
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract the invoice data from this PDF document. Return only valid JSON."
          },
          {
            type: "image_url",
            image_url: {
              url: `data:application/pdf;base64,${base64}`
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

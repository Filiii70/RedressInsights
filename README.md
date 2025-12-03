# Redress - B2B Payment Behavior Registry

**The Graydon for KMO's — realtime, crowd-sourced and affordable**

Redress is a modern B2B financial data platform for tracking and analyzing payment behavior of companies in the Benelux region. It offers real-time, crowd-sourced payment data for SMEs (KMO's), allowing businesses to assess credit risk before engaging with customers.

## 🎯 What is Redress?

Redress is a crowd-sourced SME payment behavior registry that helps businesses:

- **Upload invoices** and automatically extract data using AI (OCR)
- **Track payment behavior** of companies based on real invoice data
- **Assess credit risk** with risk scores from 0-100
- **Get actionable insights** with automatic action plan recommendations
- **Benchmark against sectors** to understand relative performance

## ✨ Key Features

### Invoice Management
- AI-powered invoice scanning with automatic data extraction
- Extracts: company name, VAT number, invoice date, amount, due date
- Supports Belgian (BE) and Dutch (NL) VAT number formats
- File upload limit: 10MB per invoice image

### Company Analysis
- Risk scores (0-100) based on payment history
- Average days to payment tracking
- Payment trend analysis (improving/stable/declining)
- Sector benchmarking

### Dashboard
- Real-time overview of outstanding invoices
- High-risk company alerts
- Payment behavior statistics
- Recent invoice activity

### Risk Analysis
- Color-coded risk levels:
  - **Low** (0-30): Good payment behavior
  - **Medium** (31-50): Some delays, monitor closely
  - **High** (51-70): Frequent late payments
  - **Critical** (71-100): Very poor payment behavior
- Automated action plan recommendations
- Historical trend visualization

## 🛡️ GDPR Compliant

Redress is designed to be GDPR compliant:
- **Only business data** is stored (VAT numbers, company names, invoice data)
- **No personal data** is collected or stored
- All data relates to B2B transactions only

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **shadcn/ui** component library
- **TanStack Query** for data fetching
- **Recharts** for data visualization
- **Wouter** for routing

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** for database operations
- **PostgreSQL** (Neon serverless) for data storage
- **OpenAI GPT-4 Vision** for invoice OCR extraction

## 📁 Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   │   ├── dashboard.tsx       # Main dashboard
│   │   │   ├── upload.tsx          # Invoice upload
│   │   │   ├── companies.tsx       # Company list
│   │   │   ├── company-detail.tsx  # Company detail view
│   │   │   ├── risk-analysis.tsx   # Risk analysis page
│   │   │   └── trends.tsx          # Payment trends
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and helpers
├── server/                 # Backend Express application
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Database operations
│   └── openai.ts           # AI invoice extraction
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema (Drizzle)
└── README.md
```

## 📊 Database Schema

### Companies Table
| Field | Type | Description |
|-------|------|-------------|
| id | serial | Primary key |
| vatNumber | varchar | Unique VAT/BTW number (BE/NL format) |
| name | varchar | Company name |
| sector | varchar | Industry sector |
| city | varchar | City location |
| country | varchar | Country (BE/NL) |

### Invoices Table
| Field | Type | Description |
|-------|------|-------------|
| id | serial | Primary key |
| companyId | integer | Foreign key to companies |
| invoiceNumber | varchar | Invoice reference number |
| invoiceDate | date | Date invoice was issued |
| dueDate | date | Payment due date |
| amount | numeric | Invoice amount in EUR |
| status | varchar | pending / paid / overdue |
| paidDate | date | Date payment was received |

### Payment Records Table
| Field | Type | Description |
|-------|------|-------------|
| id | serial | Primary key |
| companyId | integer | Foreign key to companies |
| invoiceId | integer | Foreign key to invoices |
| daysLate | integer | Days past due date |
| amount | numeric | Payment amount |
| paymentDate | date | When payment was made |

### Company Stats Table
| Field | Type | Description |
|-------|------|-------------|
| id | serial | Primary key |
| companyId | integer | Foreign key to companies |
| riskScore | integer | Risk score 0-100 |
| avgDaysToPayment | numeric | Average days to pay |
| totalInvoices | integer | Total invoices tracked |
| paidOnTime | integer | Invoices paid on time |
| paidLate | integer | Invoices paid late |
| trend | varchar | improving / stable / declining |

## 🔌 API Endpoints

### Invoices

**POST /api/invoices/upload**
Upload an invoice image for AI extraction.
- Content-Type: `multipart/form-data`
- Body: `file` (image, max 10MB)
- Returns: Extracted invoice data (company, VAT, amount, dates)

**GET /api/invoices**
Get all invoices.
- Returns: Array of invoice objects

**POST /api/invoices**
Create a new invoice manually.
- Body: `{ companyId, invoiceNumber, invoiceDate, dueDate, amount }`

**PATCH /api/invoices/:id/status**
Update invoice payment status.
- Body: `{ status: "paid" | "pending" | "overdue", paidDate? }`

### Companies

**GET /api/companies**
Get all companies with their stats.
- Returns: Array of company objects with risk scores

**GET /api/companies/:id**
Get company detail with payment history.
- Returns: Company object with invoices and stats

**GET /api/companies/search?vat=BE0123456789**
Search company by VAT number.
- Returns: Company object or null

### Dashboard

**GET /api/dashboard/stats**
Get dashboard statistics.
- Returns: `{ totalOutstanding, avgDaysToPayment, highRiskCount, overdueCount }`

### Risk Analysis

**GET /api/risk/analysis**
Get risk analysis data for all companies.
- Returns: Array of companies with risk scores and trends

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or use Replit's built-in Neon database)
- OpenAI API key

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# OpenAI (for invoice OCR)
OPENAI_API_KEY=sk-your-openai-api-key

# Session
SESSION_SECRET=your-random-session-secret
```

### Running on Replit

1. The database is automatically provisioned (Neon PostgreSQL)
2. Add your `OPENAI_API_KEY` in the Secrets tab
3. Click "Run" - the app starts automatically on port 5000

### Running Locally

1. Clone the repository:
```bash
git clone https://github.com/Filiii70/redress-kmo-register.git
cd redress-kmo-register
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (copy `.env.example` to `.env`)

4. Push database schema:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 🤖 Invoice OCR Flow

1. User uploads invoice image (PNG, JPG, PDF)
2. Image is sent to OpenAI GPT-4 Vision API
3. AI extracts:
   - Company name
   - VAT/BTW number (normalized to BE/NL format)
   - Invoice date
   - Due date
   - Amount
4. User confirms extracted data
5. Invoice is saved and linked to company
6. Company risk score is recalculated

### Supported VAT Formats
- Belgian: `BE0123456789` or `BE 0123 456 789`
- Dutch: `NL123456789B01`

## 💰 Pricing Model (Planned)

| Plan | Price | Features |
|------|-------|----------|
| Free | €0/month | Basic lookups, limited data |
| Pro | €29/month | Unlimited lookups, full history |
| API | €99/month | API access, bulk operations |

## 🤝 Network Effect

Redress becomes more valuable as more users contribute invoice data. The platform creates a crowd-sourced database of payment behavior that benefits all participants:

- More invoices = More accurate risk scores
- More companies = Broader coverage
- Real-time data = Current insights

**Target: 100-500 active users** to reach critical mass for reliable payment behavior data.

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Contact

For questions or support, please contact the development team.

---

**Built for the Benelux SME community**

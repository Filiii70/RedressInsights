# KMO-Alert - B2B Payment Behavior Platform

## Overview

KMO-Alert is a B2B financial data platform for tracking and analyzing payment behavior of companies in the Benelux region. It's designed as a modern alternative to traditional credit reporting services, offering real-time, crowd-sourced payment data for SMEs (KMO's). The platform allows businesses to upload invoices, automatically extract data using AI, and analyze payment patterns to assess credit risk before engaging with customers.

**Tagline**: "The Graydon for KMO's — but realtime, crowd-sourced and affordable."

## User Preferences

- **UI Language**: ALL text in Dutch (fully translated)
- **CRITICAL**: ALL pages must have fixed-height layout with NO vertical scrolling
- **CRITICAL**: NEVER modify dashboard UI without explicit request
- **CRITICAL**: NO emojis anywhere - clean, professional design with Lucide icons only
- Dashboard must remain publicly accessible without login
- Design philosophy: Focus on "verslaving" (addiction) - engagement drives data contribution

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast hot module replacement
- Wouter for lightweight client-side routing without the overhead of React Router
- TailwindCSS for utility-first styling with custom design tokens

**UI Component System**
- shadcn/ui component library (Radix UI primitives) for accessible, customizable components
- Custom design system based on Stripe's professional restraint combined with Linear's modern typography
- Recharts for financial data visualizations (charts, gauges, trends)
- Dark mode support with theme toggle functionality

**Layout Design**
- Fixed-height layouts on ALL pages - no scrolling
- Sidebar: Compact, non-scrolling with menu at top, footer at bottom (mt-auto)
- Dashboard: Two-row grid layout (Actieve opvolging + Klantverdeling / Aandachtspunten)
- All content must fit within viewport height
- Dashboard sections reframed positively: "Actieve opvolging" (actions), "Klantverdeling" (distribution), "Aandachtspunten" (attention)
- **Bottom Banner**: Scrolling ticker showing KMO-Alert's OWN business data (Ontvangen, Te innen, Achterstallig, Open facturen, Op tijd betaald, Betrouwbare klanten)

**State Management & Data Fetching**
- TanStack Query (React Query) for server state management, caching, and background refetching
- Custom query client configuration with infinite stale time for predictable data behavior
- Form state managed through React Hook Form with Zod validation

**Design Principles**
- Professional fintech aesthetic with Inter font for UI and JetBrains Mono for financial data
- Information-dense but scannable layouts optimized for financial decision-making
- Consistent spacing using Tailwind's 2, 4, 6, 8, 12, 16 unit system

### Backend Architecture

**Server Framework**
- Express.js server with TypeScript for type-safe API development
- HTTP-only architecture (no WebSocket complexity)
- Middleware chain: JSON parsing with raw body capture, URL encoding, request logging

**API Structure**
- RESTful endpoints organized by domain (invoices, companies, dashboard stats, blacklist)
- File upload handling via Multer with 10MB limit and memory storage
- Centralized error handling with HTTP status codes

**Database Layer**
- Drizzle ORM for type-safe database operations with PostgreSQL
- Neon serverless PostgreSQL with WebSocket support for edge deployments
- Schema-driven approach with relations and type inference
- Connection pooling for efficient database access

**Database Schema**
- **Companies**: VAT number-indexed business entities with sector classification, geographic data, and `isCustomer` flag
- **Invoices**: Payment records linked to companies with status tracking (pending, paid, overdue)
- **PaymentBehavior**: Aggregated metrics per company (risk scores, trends, payment statistics)
- **SectorBenchmarks**: Industry comparison data for contextual risk analysis
- **ActivityFeed**: Event logging for platform activities with company relations
- **Blacklist**: Company risk tracking with status (active/removed), reason, riskScoreAtTime, addedBy

**Business Logic**
- Risk scoring algorithm (0-100 scale) based on payment history and days late
- Automatic payment behavior recalculation when invoices are updated
- Action plan generation based on risk levels (low/medium/high/critical)
- Dashboard statistics aggregation for real-time insights
- Blacklist management for high-risk companies

**Dashboard Data Separation**
- **Top Stats Row**: Shows KMO-Alert's OWN private business metrics only
  - Ontvangen (green): Payments received from YOUR customers
  - Te innen (orange): Outstanding amounts from YOUR customers
  - Achterstallig (red): Overdue invoices from YOUR customers
  - Open facturen: Pending invoices to YOUR customers
- **Bottom Banner**: Scrolling ticker with YOUR company's financial KPIs
  - Uses `isCustomer = true` filter to show only YOUR client data
  - NO network/community data mixed in
- **Data Source**: `/api/dashboard/stats` filters on companies where `isCustomer = true`

**Auto-Blacklist System**
- High-risk companies (risk score >= 70) automatically added to blacklist
- Based on crowd-sourced payment behavior data from all registered members
- Creates public activity event when company is blacklisted
- Endpoint: POST /api/blacklist/auto-populate to trigger auto-blacklisting

### Pages & Navigation

**Sidebar Menu (Compact, Non-scrolling)** - ALL IN ENGLISH
- Menu: Dashboard, Invoices, Companies, Upload
- Analysis: Risk Analysis, Trends, Blacklist, Leaderboard
- Footer: About KMO-Alert (red), BTW Check, Settings, Login

**Main Pages** - ALL IN ENGLISH
- Dashboard: Stats row (Received, Outstanding, Overdue, Open invoices), Active Follow-up, Risk Distribution, Actions, Bottom banner with scrolling KPIs
- Invoices: Invoice list with filtering
- Companies: Company directory with column tooltips
- Upload: AI-powered invoice upload
- Risk Analysis: Risk scoring analysis
- Trends: Payment behavior trends
- Blacklist: Manage blacklisted companies (auto-populated from high-risk companies)
- Leaderboard: Top performers ranking
- BTW Check: VAT number verification (BE/NL/LU)
- Settings: User preferences

### External Dependencies

**AI/ML Services**
- OpenAI GPT-4 for invoice data extraction from images
- Vision API integration for processing invoice scans and PDFs
- Structured JSON extraction of company names, VAT numbers, amounts, dates, and payment status
- Automatic VAT number normalization for Belgian/Dutch formats

**Database Service**
- Neon serverless PostgreSQL database
- Environment-based connection string configuration
- WebSocket constructor integration for serverless compatibility

**Third-Party Libraries**
- date-fns for date manipulation and formatting (Dutch locale support)
- zod for runtime type validation and schema generation
- nanoid for generating unique identifiers
- class-variance-authority for type-safe component variants

**Development Tools**
- ESBuild for fast server bundling with selective dependency bundling
- Drizzle Kit for database migrations and schema management
- TypeScript compiler with strict mode and path aliases (@, @shared, @assets)
- Replit-specific plugins for development environment integration

**Deployment Strategy**
- Separate client and server builds into dist/ directory
- Client assets served as static files from dist/public
- Server bundled as single CommonJS file (dist/index.cjs)
- Target domain: www.kmo-alert.be

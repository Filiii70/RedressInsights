# KMO-Alert - B2B Payment Behavior Platform

## Overview

KMO-Alert is a B2B financial data platform for tracking and analyzing payment behavior of companies in the Benelux region. It's designed as a modern alternative to traditional credit reporting services, offering real-time, crowd-sourced payment data for SMEs (KMO's). The platform allows businesses to upload invoices, automatically extract data using AI, and analyze payment patterns to assess credit risk before engaging with customers.

## User Preferences

Preferred communication style: Simple, everyday language.

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

**State Management & Data Fetching**
- TanStack Query (React Query) for server state management, caching, and background refetching
- Custom query client configuration with infinite stale time for predictable data behavior
- Form state managed through React Hook Form with Zod validation

**Design Principles**
- Professional fintech aesthetic with Inter font for UI and JetBrains Mono for financial data
- Information-dense but scannable layouts optimized for financial decision-making
- 12-column grid system with responsive breakpoints
- Consistent spacing using Tailwind's 2, 4, 6, 8, 12, 16 unit system

### Backend Architecture

**Server Framework**
- Express.js server with TypeScript for type-safe API development
- HTTP-only architecture (no WebSocket complexity)
- Middleware chain: JSON parsing with raw body capture, URL encoding, request logging

**API Structure**
- RESTful endpoints organized by domain (invoices, companies, dashboard stats)
- File upload handling via Multer with 10MB limit and memory storage
- Centralized error handling with HTTP status codes

**Database Layer**
- Drizzle ORM for type-safe database operations with PostgreSQL
- Neon serverless PostgreSQL with WebSocket support for edge deployments
- Schema-driven approach with relations and type inference
- Connection pooling for efficient database access

**Database Schema**
- **Companies**: VAT number-indexed business entities with sector classification and geographic data
- **Invoices**: Payment records linked to companies with status tracking (pending, paid, overdue)
- **PaymentBehavior**: Aggregated metrics per company (risk scores, trends, payment statistics)
- **SectorBenchmarks**: Industry comparison data for contextual risk analysis

**Business Logic**
- Risk scoring algorithm (0-100 scale) based on payment history and days late
- Automatic payment behavior recalculation when invoices are updated
- Action plan generation based on risk levels (low/medium/high/critical)
- Dashboard statistics aggregation for real-time insights

### External Dependencies

**AI/ML Services**
- OpenAI GPT-5 for invoice data extraction from images
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
- Replit-specific plugins for development environment integration (cartographer, dev banner, runtime error overlay)

**Deployment Strategy**
- Separate client and server builds into dist/ directory
- Client assets served as static files from dist/public
- Server bundled as single CommonJS file (dist/index.cjs)
- Selective dependency bundling to reduce cold start times (allowlist approach)
- Production mode uses compiled artifacts, development uses Vite HMR
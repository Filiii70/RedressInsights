# PayTrend.be - Payment Behavior Monitoring Platform

## Overview

PayTrend.be is a B2B payment behavior monitoring platform for tracking invoice payments and detecting early warning signs when payment patterns change. The app provides a simple, read-only view of payment data with intelligent early alerts.

**Core Concept**: Payment behavior register with early alerts - detect when a company that normally pays within 30 days suddenly starts paying after 30 days.

## User Preferences

- **UI Language**: English
- **Design**: Clean, professional, minimal - no clutter
- **Read-only**: Data comes via external API integration
- **Fixed-height layouts**: No vertical scrolling
- **No emojis**: Professional design with Lucide icons only

## Key Features

1. **Early Alerts** - Detect payment pattern changes before they become problems
2. **Dashboard** - Overview of received payments, outstanding amounts, overdue invoices, and alerts
3. **Invoice Tracking** - View all invoices with status (pending, overdue, paid)
4. **Company Profiles** - Payment behavior per company with trends
5. **Trends Visualization** - Historical payment patterns over time

## App Structure

### Pages
- `/` - Dashboard with early alerts and overdue invoices
- `/invoices` - Invoice list (read-only)
- `/companies` - Company list with risk indicators
- `/companies/:id` - Company detail with invoice history
- `/trends` - Payment trend charts
- `/settings` - Notification preferences

### Navigation
Simple sidebar with:
- Dashboard
- Invoices
- Companies
- Trends
- Settings (in footer)

## Technical Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui + TailwindCSS
- **Routing**: Wouter
- **State**: TanStack Query
- **Charts**: Recharts
- **Backend**: Express.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle

## Early Alert Logic

An early alert is triggered when:
- A company's latest invoice payment time exceeds their historical average by more than 10 days
- Severity levels:
  - Warning: +10-20 days above average
  - Critical: +20 days above average

## Target Domain
- www.paytrend.be

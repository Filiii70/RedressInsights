# PayTrend.be - Payment Behavior Register

## Overview

PayTrend.be is a B2B payment behavior monitoring platform (betalingsgedragregister) for tracking payment patterns and detecting early warning signs when companies' payment behavior deteriorates.

**Core Concept**: Early alert system that detects when a company's payment pattern shifts (e.g., from <30 days to >45 days).

## Current State

Single-page dashboard with:
- **Left Column**: KPIs (124 companies, 9 alerts, exposure) + all alerts visible and clickable
- **Right Column**: 2x2 chart grid matching professional vendor dashboard design
- **Alert Dialog**: Click any alert to see detailed info (sector, exposure, payment shift, recommended action)

## User Preferences

- **UI Language**: English
- **Design**: Professional, strak (tight/sleek), like vendor payment tracking examples
- **Layout**: Fixed height, no scrolling, all alerts visible
- **Colors**: Blue/orange accent colors on white cards, gray background
- **No emojis**: Professional design only

## Action Taxonomy

Based on payment day shift:
- **Monitor**: ≤10 day shift (good payers)
- **Inform**: 10-20 day shift
- **Formal Notice**: 20-25 day shift  
- **Escalate**: >25 day shift

## Technical Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui + TailwindCSS
- **Charts**: Recharts
- **Backend**: Express.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle

## Data Model

124 companies with:
- id, name, sector, exposure, avgDays, prevAvgDays, action
- 9 alert companies (non-monitor status)
- 115 monitor companies (good payers)

## Target Domain
- www.paytrend.be

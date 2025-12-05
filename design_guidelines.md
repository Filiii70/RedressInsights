# KMO-Alert Design Guidelines
**B2B Financial Data Platform - Professional Fintech Aesthetic**

## Design Approach
**Selected System**: Hybrid of Stripe's professional restraint + Linear's modern typography + specialized financial data visualization patterns

**Core Principles**:
- Trust through clarity: Information-dense but scannable
- Data-first hierarchy: Metrics and insights take visual priority
- Professional efficiency: Every element serves the user's decision-making
- Scalable consistency: Patterns that work from 10 to 10,000 data points

---

## Typography System

**Font Stack** (Google Fonts):
- Primary: **Inter** (weights: 400, 500, 600, 700)
- Monospace: **JetBrains Mono** (for financial data, VAT numbers, amounts)

**Hierarchy**:
- Page Titles: text-3xl font-bold (32px)
- Section Headers: text-xl font-semibold (20px)
- Card Titles: text-lg font-semibold (18px)
- Body/Data: text-base font-medium (16px)
- Labels: text-sm font-medium uppercase tracking-wide (14px)
- Captions/Meta: text-sm (14px)
- Financial Amounts: font-mono text-lg font-semibold
- Risk Scores: text-4xl font-bold tabular-nums

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16** exclusively
- Micro spacing: p-2, gap-2
- Standard spacing: p-4, gap-4, mb-6
- Section spacing: p-8, py-12, gap-8
- Large sections: p-16

**Grid Structure**:
- Dashboard: 12-column grid (grid-cols-12)
- Metrics row: 4-column on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- Main content: 2-column split (2/3 + 1/3 for main + sidebar)
- Data tables: Full-width with horizontal scroll on mobile

**Container Widths**:
- Dashboard: max-w-7xl mx-auto
- Content cards: w-full
- Modals/Forms: max-w-2xl

---

## Component Library

### Navigation
**Top Bar** (sticky):
- Logo + "KMO-Alert" text (left)
- Main nav: Dashboard, Invoices, Companies, Analytics (center-left)
- Search bar with company/VAT lookup (center)
- Notifications + User avatar (right)
- Height: h-16, border-b

**Sidebar** (optional for deep sections):
- Fixed left, w-64
- Collapsible to icon-only on mobile
- Nested navigation for invoice/company filters

### Dashboard Cards
**Metric Cards**:
- Rounded corners (rounded-lg)
- Border with shadow-sm
- Padding: p-6
- Structure: Label (top) → Large Value (center) → Change indicator with trend arrow (bottom)
- Include sparkline charts where relevant (mini line charts showing 7-day trend)

**Risk Indicator Cards**:
- Prominent score display (0-100) with circular progress indicator
- Status badge (Low/Medium/High/Critical)
- Supporting metrics below (avg days late, total invoices tracked)

### Data Tables
**Invoice Table**:
- Sticky header row
- Alternating row treatment
- Columns: Company | Invoice # | Amount | Due Date | Days Late | Status | Actions
- Status badges with icons (Paid/Overdue/Pending)
- Sortable headers with caret icons
- Row height: h-12
- Cell padding: px-4 py-3

**Company List**:
- Columns: Company Name | VAT # | Risk Score | Avg Days Late | Last Invoice | Trend
- Risk score with colored dot indicator
- Trend with arrow icons (↑↗→↘↓)

### Forms & Inputs
**Invoice Upload**:
- Drag-and-drop zone: Large dashed border, min-h-64
- "Drop invoice here or click to upload" centered text
- Upload icon (Heroicons: ArrowUpTrayIcon)
- Accepted formats listed below (PDF, PNG, JPG)
- Progress bar during OCR processing

**Search/Lookup**:
- Input: h-10, rounded-md, pl-10 (for search icon)
- Search icon positioned absolute left
- Dropdown results: max-h-96 overflow-y-auto
- Result items: Company name (bold) + VAT number (mono) + sector (muted)

### Buttons
**Primary Action**: 
- Rounded-md, px-4 py-2, font-medium
- Height: h-10 for standard, h-12 for prominent CTAs

**Secondary**: 
- Border variant, same sizing

**Icon Buttons**: 
- w-10 h-10, rounded-md, flex items-center justify-center

### Modals & Overlays
**Company Detail Modal**:
- max-w-4xl, centered
- Header: Company name + VAT + sector + close button
- Tabbed content: Overview | Payment History | Risk Analysis | Action Plan
- Footer with primary actions

**Action Plan Panel** (slide-out):
- Fixed right, w-96
- Recommended payment terms at top
- Step-by-step advice list
- Email/phone script expandable sections

### Data Visualization
**Risk Score Gauge**:
- Semi-circular progress indicator
- Score in center (large, bold)
- Color zones marked (0-40, 41-70, 71-100)

**Payment Trend Chart**:
- Line chart showing payment pattern over time
- X-axis: Timeline | Y-axis: Days late
- Sector benchmark line for comparison
- Height: h-64

**Cashflow Forecast**:
- Bar chart: Expected vs. at-risk amounts
- Stacked bars for risk categories
- Height: h-80

---

## Icons
**Library**: Heroicons (via CDN)
**Usage**:
- Navigation: HomeIcon, DocumentTextIcon, BuildingOfficeIcon, ChartBarIcon
- Actions: PlusIcon, ArrowUpTrayIcon, MagnifyingGlassIcon, BellIcon
- Status: CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon
- Trends: ArrowTrendingUpIcon, ArrowTrendingDownIcon
- Size: w-5 h-5 for inline, w-6 h-6 for buttons, w-8 h-8 for card headers

---

## Images
**Dashboard**: No hero image - data dashboard starts immediately after top nav
**Login/Marketing Pages**: Use professional business imagery:
- Invoice documents with highlighted data
- SME owner reviewing financial reports
- Clean office/workspace scenes
- Abstract financial graphics (graphs, data points)
- Placement: Full-width hero section (h-96) with overlay text, or split-screen (50/50) on auth pages

---

## Page-Specific Layouts

**Dashboard**:
- Top: 4 metric cards (revenue, outstanding, risk alerts, avg days)
- Middle: Recent invoices table + Risk distribution chart (2-column)
- Bottom: Top risky clients list + Cashflow forecast (2-column)

**Invoice Upload**:
- Centered layout with max-w-3xl
- Upload zone prominent at top
- Recently uploaded list below
- Extraction status with progress indicators

**Company Profile**:
- Header: Company name, VAT, sector, risk score (large)
- 3-column metrics row (total invoices, avg days late, trend)
- Tabs: Payment history table | Risk analysis chart | Recommended actions
- Sidebar: Quick actions (add invoice, set alert, export data)

**Analytics**:
- Filter bar at top (date range, sector, risk level)
- Grid of visualization cards (sector comparison, payment trends, risk distribution)
- Each card: h-80 to h-96 with title and chart

---

## Professional Polish Details
- Consistent border-radius: rounded-md (4px) for small elements, rounded-lg (8px) for cards
- Subtle shadows: shadow-sm for cards, shadow-md for modals
- Hover states: Lighten on buttons, add shadow on cards
- Loading states: Skeleton screens for tables, spinner for charts
- Empty states: Centered icon + message + CTA for empty lists
- Tooltips: Appear on hover for abbreviations, truncated text, info icons
- Badge styling: Rounded-full px-3 py-1 text-xs font-medium for status indicators

**No animations** except:
- Smooth transitions on hover (transition-colors duration-200)
- Loading spinners
- Chart rendering (subtle entrance)
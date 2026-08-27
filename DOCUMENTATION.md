# Personal Finance Tracker System - Project Documentation

## Executive Summary
The **Personal Finance Tracker** is a modern, responsive, web-based financial management system designed to empower users to monitor expenses, manage income streams, set category budgets, track long-term savings goals, and generate custom financial reports. Built on **Next.js 16 (App Router)** and **React 19**, the application combines high-performance client-side interactivity with secure user authentication and persistent state management.

---

## Technical Architecture & Design System

### 1. Framework & Core Libraries
- **Framework:** Next.js 16.3.3 (App Router)
- **Frontend Library:** React 19
- **Styling:** Vanilla CSS & Tailwind CSS with dynamic dark/light mode themes (`next-themes`)
- **UI Components & Icons:** Radix UI primitives, Lucide React icons
- **Data Visualization:** Recharts (Bar Charts, Area Charts, Donut Charts)
- **Authentication:** Clerk Authentication (`@clerk/nextjs`) with fallback Demo Mode
- **State Management & Persistence:** React Context API (`FinanceProvider`) with per-user `localStorage` isolation keying (`finance_tracker_{userId}_...`) and optional PostgreSQL/Prisma ORM database schema.

---

## Route Directory Structure

The system utilizes Next.js App Router sub-routing under `/dashboard`:

| Path | Component | Description |
| :--- | :--- | :--- |
| `/` | `app/page.tsx` | Root redirect to `/dashboard` |
| `/dashboard` | `OverviewTab.tsx` | Financial Overview, Net Worth, Monthly Cashflow, Quick Accounts |
| `/dashboard/transactions` | `TransactionsTab.tsx` | Transaction history, search filters, income/expense logging |
| `/dashboard/categories` | `CategoriesTab.tsx` | Income & expense category management |
| `/dashboard/budgets` | `BudgetsTab.tsx` | Category spending limits and 50%/80% threshold notifications |
| `/dashboard/reports` | `ReportsTab.tsx` | Date-range statement filtering and CSV export |
| `/dashboard/accounts` | `AccountsTab.tsx` | Bank accounts, credit cards, assets, and liability monitoring |
| `/dashboard/goals` | `GoalsTab.tsx` | Target savings goals with progress tracking and quick deposits |
| `/dashboard/profile` | `ProfileTab.tsx` | User profile, theme customizer, and security credentials |
| `/dashboard/analytics` | `AnalyticsTab.tsx` | Cashflow trends, financial health score, and DTI metrics |

---

## Requirements Traceability Matrix

### Functional Requirements (FR1 – FR10)

| Requirement Code | Description | System Implementation |
| :--- | :--- | :--- |
| **FR1** | User Registration & Authentication | Integrated with Clerk Authentication (`/sign-in`, `/sign-up`) supporting secure session handling. Password hashing is managed securely. |
| **FR2** | Income Recording | Users record income transactions specifying amount, source category, account, date, payee, and optional notes via the "New Transaction" modal. |
| **FR3** | Expense Recording | Users log expense entries linked to specific categories and accounts, instantly adjusting account balances and monthly budget caps. |
| **FR4** | Category Management | Custom income and expense categories can be added, updated, or removed with custom color badges (`CategoriesTab.tsx`). |
| **FR5** | Budgeting & Threshold Monitoring | Users establish monthly expenditure caps for specific categories. The system automatically computes current spending versus budget limits. |
| **FR6** | Automatic Budget Alerts | Implements an alert model triggering notices when category spending crosses 50% and 80% thresholds. |
| **FR7** | Financial Summary & Overview | Displays total net worth, total monthly income, total expenses, savings rate, and recent transactions on the Overview dashboard (`/dashboard`). |
| **FR8** | Reporting & Data Export | Allows users to filter transaction records by custom start/end dates and export clean CSV reports (`ReportsTab.tsx`). |
| **FR9** | Profile & Account Management | Users view and update personal profile details (`ProfileTab.tsx`). Account identity fields (email) remain read-only to match authenticated credentials. |
| **FR10** | Multiple Account Management | Supports tracking checking, savings, investment, and credit card accounts (`AccountsTab.tsx`) with automatic balance adjustments. |

### Non-Functional Requirements (NFR1 – NFR8)

| Requirement Code | Description | System Implementation |
| :--- | :--- | :--- |
| **NFR1** | Usability | Clean, intuitive glassmorphism interface featuring responsive navigation, instant search inputs, and dark/light visual modes. |
| **NFR2** | Performance | Fast sub-second page navigation powered by Next.js Server & Client components with zero layout shift during route transitions. |
| **NFR3** | Security & Data Isolation | Strict isolation of user transaction records in local browser storage partitioned by user ID (`userId`), backed by Clerk auth tokens. |
| **NFR4** | Scalability | Modular React Context architecture allowing seamless migration between browser storage and production SQL databases (PostgreSQL/Prisma). |
| **NFR5** | Reliability | Robust error boundaries, graceful fallbacks for demo users, and input validation across all modal forms. |
| **NFR6** | Portability | Cross-platform web application compatible with all modern browsers (Chrome, Firefox, Safari, Edge) and mobile screen sizes. |
| **NFR7** | Maintainability | Clean TypeScript codebase following Next.js App Router conventions and modular UI component organization. |
| **NFR8** | Data Exportability | Instant CSV report generation using standard data formats for easy importing into Excel or third-party accounting software. |

---

## Data Model & Schema

```prisma
model User {
  id           String        @id @default(uuid())
  email        String        @unique
  fullName     String
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  accounts     Account[]
  categories   Category[]
  transactions Transaction[]
  budgets      Budget[]
  goals        Goal[]
}

model Account {
  id            String        @id @default(uuid())
  userId        String
  name          String
  type          AccountType
  balance       Float
  accountNumber String?
  color         String?
  transactions  Transaction[]
}

model Category {
  id           String          @id @default(uuid())
  userId       String
  name         String
  type         TransactionType
  color        String
  icon         String
  budgets      Budget[]
  transactions Transaction[]
}

model Transaction {
  id          String          @id @default(uuid())
  userId      String
  accountId   String
  categoryId  String?
  amount      Float
  type        TransactionType
  date        DateTime
  description String
  payee       String?
}
```

---

## Deployment & Local Execution

To run the application locally:

```bash
# 1. Install dependencies
npm install

# 2. Run Next.js development server
npm run dev

# 3. Build production bundle
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

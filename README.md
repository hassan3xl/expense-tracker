# Finance Tracker - Web-Based Expense Monitoring & Budget Management System

A full-stack Personal Finance Tracker web app built with **Next.js**, **TypeScript**, **pnpm**, **shadcn/ui**, **Tailwind CSS**, **Clerk Authentication**, **Prisma ORM**, and **PostgreSQL (Docker)**.

---

## 🌟 Key Features

- 📊 **Financial Dashboard**: Real-time Net Worth, Monthly Income, Expenses, and Savings Rate calculations.
- 💳 **Accounts & Assets**: Manage Checking, Savings, Credit Cards, and Investment accounts.
- 🧾 **Transactions**: Record and filter income, expenses, and transfers by date, payee, category, and account.
- 🎯 **Monthly Budgets**: Category-based spending limits with over-budget alerts.
- 🚀 **Savings Goals**: Track milestones (Emergency Fund, New Car, Vacation) with quick deposit features.
- 📈 **Analytics & Insights**: Recharts visual trend analysis and spending distribution.
- 🔐 **Clerk Authentication**: Secure authentication & user profile management.
- 🐘 **PostgreSQL & Prisma**: Dockerized PostgreSQL database with Prisma schema models.

---

## 🚀 Getting Started

### 1. Requirements
Make sure you have installed:
- Node.js v18+ & pnpm (`pnpm --version`)
- Docker & Docker Compose (`docker compose version`)

### 2. Start Local PostgreSQL Database via Docker
Run the following command to start PostgreSQL 16 on `localhost:5432`:
```bash
pnpm db:up
```

To stop the database container when finished:
```bash
pnpm db:down
```

### 3. Push Prisma Database Schema
Push the Prisma models to your running PostgreSQL container:
```bash
pnpm db:push
```

You can open Prisma Studio to view database contents interactively:
```bash
pnpm db:studio
```

### 4. Configure Clerk Authentication (Optional)
Update `.env.local` with your publishable key and secret key from [Clerk Dashboard](https://dashboard.clerk.com):
```env
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/financetracker?schema=public"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
```
*(Note: If Clerk keys are not set, the app will run in Demo mode).*

### 5. Run Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠 Project Architecture

```
fianance-tracker/
├── docker-compose.yaml       # PostgreSQL 16 Docker setup
├── prisma/
│   └── schema.prisma         # Models: User, Account, Category, Transaction, Budget, Goal
├── src/
│   ├── app/                  # Next.js App Router (pages & API routes)
│   ├── components/
│   │   ├── ui/               # shadcn/ui primitives (Button, Card, Dialog, Select, etc.)
│   │   ├── layout/           # Header & Sidebar navigation
│   │   ├── dashboard/        # Dashboard tabs (Overview, Transactions, Accounts, etc.)
│   │   └── modals/           # Add Transaction, Add Account, Add Budget, Add Goal modals
│   ├── lib/                  # db singleton, mock data, utility formatters
│   └── middleware.ts         # Clerk routing middleware
```

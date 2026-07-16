import React from "react";
import { getSessionUser, getCurrentProject } from "@/lib/auth";
import { sql } from "@/lib/db";
import Navbar from "@/components/layout/Navbar";
import Header from "@/components/Header";
import TransactionForm from "@/components/dashboard/TransactionForm";
import DebtForm from "@/components/dashboard/DebtForm";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import ActiveDebts from "@/components/dashboard/ActiveDebts";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "sonner";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Landmark,
  Activity,
  ArrowRight,
  TrendingDown,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { formatNaira } from "@/lib/utils";
import DateSwitcher from "@/components/dashboard/DateSwitcher";

export const dynamic = "force-dynamic";

interface DashboardPageProps {
  searchParams: Promise<{
    date?: string;
  }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const user = await getSessionUser();
  if (!user) return null;

  const resolvedParams = await searchParams;

  // Get active project and list of all projects
  const currentProj = await getCurrentProject(user.userId);
  const projectsData = await sql`
    SELECT DISTINCT p.id, p.name FROM projects p
    LEFT JOIN project_members pm ON pm.project_id = p.id
    WHERE p.user_id = ${user.userId} OR pm.user_id = ${user.userId}
    ORDER BY p.name ASC
  `;
  const projects = (projectsData || []).map((p) => ({
    id: Number(p.id),
    name: String(p.name),
  }));

  // Calculate default timezone-safe local date string for today
  const todayDate = new Date();
  const offset = todayDate.getTimezoneOffset();
  const localTodayStr = new Date(todayDate.getTime() - offset * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const selectedDateStr = resolvedParams.date || localTodayStr;

  // Fetch transactions for the active project on the selected day
  const transactionsData = await sql`
    SELECT id, type, category, amount, description, date 
    FROM transactions 
    WHERE project_id = ${currentProj.id}
      AND date >= ${selectedDateStr + " 00:00:00"}
      AND date <= ${selectedDateStr + " 23:59:59"}
    ORDER BY date DESC
  `;

  // Fetch debts for the active project
  const debtsData = await sql`
    SELECT id, person, type, amount, remaining_amount, description, due_date, status, created_at 
    FROM debts 
    WHERE project_id = ${currentProj.id}
    ORDER BY created_at DESC
  `;

  // Explicit type assertions for the database result
  const transactions = (transactionsData || []).map((tx) => ({
    id: Number(tx.id),
    type: String(tx.type),
    category: String(tx.category),
    amount: String(tx.amount),
    description: String(tx.description || ""),
    date: String(tx.date),
  }));

  const debts = (debtsData || []).map((d) => ({
    id: Number(d.id),
    person: String(d.person),
    type: String(d.type),
    amount: String(d.amount),
    remaining_amount: String(d.remaining_amount),
    description: String(d.description || ""),
    due_date: d.due_date ? String(d.due_date) : null,
    status: String(d.status),
    created_at: String(d.created_at),
  }));

  // Calculations
  let totalIncome = 0; // Total earnings (including loans/debts)
  let totalExpense = 0; // Total expenses (including loans/debts)
  let allIncome = 0; // All cash inflows
  let allExpense = 0; // All cash outflows

  transactions.forEach((tx) => {
    const val = parseFloat(tx.amount);

    // Cash on Hand calculation
    if (tx.type === "income") allIncome += val;
    else if (tx.type === "expense") allExpense += val;

    // Include everything in total income & expense
    if (tx.type === "income") totalIncome += val;
    else if (tx.type === "expense") totalExpense += val;
  });

  const netBalance = totalIncome - totalExpense;
  const cashOnHand = allIncome - allExpense;

  let totalOwedToMe = 0; // Receivable
  let totalOwedByMe = 0; // Payable

  debts.forEach((debt) => {
    if (debt.status === "active") {
      const remaining = parseFloat(debt.remaining_amount);
      if (debt.type === "owed_to_me") totalOwedToMe += remaining;
      else if (debt.type === "owed_by_me") totalOwedByMe += remaining;
    }
  });

  // Dynamic Date Display Label
  const selectedDateObj = new Date(selectedDateStr);
  const isSelectedToday = selectedDateStr === localTodayStr;
  const dateLabel = isSelectedToday
    ? "today"
    : selectedDateObj.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

  return (
    <main>
      <Header
        title={`Welcome back, ${user.username}`}
        subtitle={`Here is your financial status overview for ${dateLabel}.`}
        showRefresh={false}
        actions={<DateSwitcher initialDate={selectedDateStr} />}
        stats={[
          {
            title: "Net Balance",
            value: `${netBalance >= 0 ? "+" : "-"}${formatNaira(Math.abs(netBalance))}`,
            icon:
              netBalance >= 0 ? (
                <TrendingUp className="size-5" />
              ) : (
                <TrendingDown className="size-5" />
              ),
            iconBg:
              netBalance >= 0
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-rose-500/10 text-rose-400",
            description: "Earnings minus Expenses",
          },
          {
            title: "Total Earned",
            value: formatNaira(totalIncome),
            icon: <ArrowUpRight className="size-5" />,
            iconBg: "bg-indigo-500/10 text-indigo-400",
            description: "Total incoming earnings",
          },
          {
            title: "Total Spent",
            value: formatNaira(totalExpense),
            icon: <ArrowDownRight className="size-5" />,
            iconBg: "bg-rose-500/10 text-rose-400",
            description: "Total outgoing expenses",
          },
          {
            title: "Net Debts / Loans",
            value: (
              <div className="mt-0.5 space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs text-violet-400 font-bold">
                  <span>Lent:</span>
                  <span>{formatNaira(totalOwedToMe)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                  <span>Owe:</span>
                  <span>{formatNaira(totalOwedByMe)}</span>
                </div>
              </div>
            ),
            icon: <Landmark className="size-5" />,
            iconBg: "bg-muted text-muted-foreground",
          },
        ]}
      />

      {/* Dashboard Main Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Forms (lg:span-5) */}
        <div className="lg:col-span-5 space-y-6">
          {currentProj.role === "viewer" ? (
            <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-border rounded-3xl bg-card/10 min-h-[300px]">
              <Activity className="size-10 text-primary/60 mb-3" />
              <h4 className="text-base font-bold text-foreground">
                Read-Only Access
              </h4>
              <p className="text-muted-foreground text-sm mt-1.5 max-w-sm leading-relaxed">
                You are a viewer on this project. You can inspect logs, metrics,
                and trends but cannot record transactions, log payments, or
                delete records.
              </p>
            </div>
          ) : (
            <>
              <TransactionForm />
              <DebtForm />
            </>
          )}
        </div>

        {/* Right Column: Feeds & Lists (lg:span-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Recent Transactions Feed */}
          <div className="border-t sm:border border-border/60 bg-card/20 sm:rounded-3xl py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Activity className="size-5 text-primary" />
                Recent Transactions
              </h3>
              <Link
                href="/transactions"
                className="text-xs font-semibold text-primary hover:text-primary/80 inline-flex items-center gap-1 group"
              >
                View All
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <RecentTransactions
              transactions={transactions}
              limit={5}
              readOnly={currentProj.role === "viewer"}
            />
          </div>
          <hr className="border-border/60" />

          {/* Active Debts & Loans Feed */}
          <div className="borde sm:border border-border/60 bg-card/20 rounded-3xl py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Landmark className="size-5 text-primary" />
                Active Debts & Loans
              </h3>
              <Link
                href="/debts"
                className="text-xs font-semibold text-primary hover:text-primary/80 inline-flex items-center gap-1 group"
              >
                Manage All
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <ActiveDebts
              debts={debts}
              readOnly={currentProj.role === "viewer"}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

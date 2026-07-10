import React from "react";
import { getSessionUser, getCurrentProject } from "@/lib/auth";
import { sql } from "@/lib/db";
import Navbar from "@/components/layout/Navbar";
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

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) return null;

  // Get active project and list of all projects
  const currentProj = await getCurrentProject(user.userId);
  const projectsData = await sql`
    SELECT id, name FROM projects WHERE user_id = ${user.userId} ORDER BY name ASC
  `;
  const projects = (projectsData || []).map((p) => ({
    id: Number(p.id),
    name: String(p.name),
  }));

  // Fetch transactions for the active project
  const transactionsData = await sql`
    SELECT id, type, category, amount, description, date 
    FROM transactions 
    WHERE user_id = ${user.userId} AND project_id = ${currentProj.id}
    ORDER BY date DESC
  `;

  // Fetch debts for the active project
  const debtsData = await sql`
    SELECT id, person, type, amount, remaining_amount, description, due_date, status, created_at 
    FROM debts 
    WHERE user_id = ${user.userId} AND project_id = ${currentProj.id}
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
  let totalIncome = 0; // Regular earnings
  let totalExpense = 0; // Regular expenses
  let allIncome = 0; // All cash inflows (incl. loans/repayments)
  let allExpense = 0; // All cash outflows (incl. loans/payments)

  const DEBT_CATEGORIES = [
    "Loan Borrowed",
    "Debt Repayment",
    "Loan Lent",
    "Debt Payment",
  ];

  transactions.forEach((tx) => {
    const val = parseFloat(tx.amount);

    // Cash on Hand calculation
    if (tx.type === "income") allIncome += val;
    else if (tx.type === "expense") allExpense += val;

    // Regular earnings and expenses (excl. debts)
    if (!DEBT_CATEGORIES.includes(tx.category)) {
      if (tx.type === "income") totalIncome += val;
      else if (tx.type === "expense") totalExpense += val;
    }
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

  // Current Date Welcome Message
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans">
      <Navbar
        username={user.username}
        initialProjects={projects}
        currentProject={currentProj}
      />

      {/* Toast Notification Container */}
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "#0f172a",
            border: "1px solid #1e293b",
            color: "#f8fafc",
          },
        }}
      />

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 space-y-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-50 via-slate-100 to-indigo-200">
              Welcome back, {user.username}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Here is your financial status overview for today.
            </p>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-zinc-900/60 border border-slate-800/80 text-xs sm:text-sm font-semibold text-slate-300 self-start sm:self-center">
            {today}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-in fade-in duration-500 delay-100">
          {/* Cash on Hand Card */}
          {/* <Card className="border border-indigo-500/20 bg-gradient-to-br from-indigo-950/20 via-zinc-900/60 to-black/40 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/10">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Cash on Hand</span>
                <h3 className={`text-2xl font-black mt-1.5 tracking-tight ${cashOnHand >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {cashOnHand >= 0 ? '+' : '-'}{formatNaira(Math.abs(cashOnHand))}
                </h3>
                <p className="text-[10px] text-slate-500 mt-1">Actual available money</p>
              </div>
              <div className={`p-3 rounded-2xl ${cashOnHand >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                <Wallet className="size-5" />
              </div>
            </CardContent>
          </Card> */}

          {/* Net Balance Card */}
          <Card className="border border-slate-800/80 bg-gradient-to-br from-zinc-900/60 to-black/40 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/10">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Net Balance
                </span>
                <h3
                  className={`text-2xl font-black mt-1.5 tracking-tight ${netBalance >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                >
                  {netBalance >= 0 ? "+" : "-"}
                  {formatNaira(Math.abs(netBalance))}
                </h3>
                <p className="text-[10px] text-slate-500 mt-1">
                  Earnings minus Expenses
                </p>
              </div>
              <div
                className={`p-3 rounded-2xl ${netBalance >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}
              >
                {netBalance >= 0 ? (
                  <TrendingUp className="size-5" />
                ) : (
                  <TrendingDown className="size-5" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Income Card */}
          <Card className="border border-slate-800/80 bg-gradient-to-br from-zinc-900/60 to-black/40 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/10">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Earned
                </span>
                <h3 className="text-2xl font-black mt-1.5 text-slate-100 tracking-tight">
                  {formatNaira(totalIncome)}
                </h3>
                <p className="text-[10px] text-slate-500 mt-1">
                  Total incoming earnings
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                <ArrowUpRight className="size-5" />
              </div>
            </CardContent>
          </Card>

          {/* Expenses Card */}
          <Card className="border border-slate-800/80 bg-gradient-to-br from-zinc-900/60 to-black/40 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/10">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Spent
                </span>
                <h3 className="text-2xl font-black mt-1.5 text-slate-100 tracking-tight">
                  {formatNaira(totalExpense)}
                </h3>
                <p className="text-[10px] text-slate-500 mt-1">
                  Total outgoing expenses
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400">
                <ArrowDownRight className="size-5" />
              </div>
            </CardContent>
          </Card>

          {/* Outstanding Debts Card */}
          <Card className="border border-slate-800/80 bg-gradient-to-br from-zinc-900/60 to-black/40 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/10">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Net Debts / Loans
                </span>
                <div className="mt-1.5 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs text-violet-400 font-bold">
                    <span>Lent:</span>
                    <span>{formatNaira(totalOwedToMe)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                    <span>Owe:</span>
                    <span>{formatNaira(totalOwedByMe)}</span>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-800 text-slate-300">
                <Landmark className="size-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Main Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input Forms (lg:span-5) */}
          <div className="lg:col-span-5 space-y-6 animate-in fade-in duration-500 delay-200">
            <TransactionForm />
            <DebtForm />
          </div>

          {/* Right Column: Feeds & Lists (lg:span-7) */}
          <div className="lg:col-span-7 space-y-6 animate-in fade-in duration-500 delay-300">
            {/* Recent Transactions Feed */}
            <div className="border border-slate-800/60 bg-slate-900/20 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-xl shadow-black/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <Activity className="size-5 text-indigo-400" />
                  Recent Transactions
                </h3>
                <Link
                  href="/transactions"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 group transition-colors"
                >
                  View All
                  <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
              <RecentTransactions transactions={transactions} limit={5} />
            </div>

            {/* Active Debts & Loans Feed */}
            <div className="border border-slate-800/60 bg-slate-900/20 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-xl shadow-black/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <Landmark className="size-5 text-indigo-400" />
                  Active Debts & Loans
                </h3>
                <Link
                  href="/debts"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 group transition-colors"
                >
                  Manage All
                  <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
              <ActiveDebts debts={debts} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

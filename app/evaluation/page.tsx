import React from "react";
import { getSessionUser, getCurrentProject } from "@/lib/auth";
import { sql } from "@/lib/db";
import Navbar from "@/components/layout/Navbar";
import Header from "@/components/Header";
import EvaluationFilters from "@/components/evaluation/EvaluationFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Landmark,
  Calendar,
  AlertCircle,
  Activity,
  Sparkles,
  Info,
  PiggyBank,
  ArrowRight,
  TrendingUp as TrendingUpIcon,
  FlameKindling,
} from "lucide-react";
import { formatNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface EvaluationPageProps {
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function EvaluationPage({
  searchParams,
}: EvaluationPageProps) {
  const user = await getSessionUser();
  if (!user) return null;

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

  // Resolve search parameters (Next.js 15+ searchParams is a Promise)
  const resolvedParams = await searchParams;

  // Default range: Start of the current month to today
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const defaultStartDate = firstDayOfMonth.toISOString().split("T")[0];
  const defaultEndDate = now.toISOString().split("T")[0];

  const startDate = resolvedParams.startDate || defaultStartDate;
  const endDate = resolvedParams.endDate || defaultEndDate;

  // Format dates for display
  const formatDateDisplay = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Fetch transactions in date range
  const transactionsData = await sql`
    SELECT id, type, category, amount, description, date 
    FROM transactions 
    WHERE project_id = ${currentProj.id}
      AND date >= ${startDate + " 00:00:00"}
      AND date <= ${endDate + " 23:59:59"}
    ORDER BY date DESC
  `;

  const transactions = (transactionsData || []).map((tx) => ({
    id: Number(tx.id),
    type: String(tx.type),
    category: String(tx.category),
    amount: String(tx.amount),
    description: String(tx.description || ""),
    date: String(tx.date),
  }));

  // Calculations
  let totalIncome = 0; // Total earnings (including loans/debts)
  let totalExpense = 0; // Total expenses (including loans/debts)
  let allIncome = 0; // All cash inflows
  let allExpense = 0; // All cash outflows

  let totalBorrowed = 0;
  let totalLent = 0;
  let totalDebtPayments = 0;
  let totalDebtRepayments = 0;

  const categoryTotals: Record<string, { type: string; amount: number }> = {};

  transactions.forEach((tx) => {
    const val = parseFloat(tx.amount);

    // Total cash flow including everything (Cash on Hand)
    if (tx.type === "income") allIncome += val;
    else if (tx.type === "expense") allExpense += val;

    // Track debt transactions
    if (tx.category === "Loan Borrowed") totalBorrowed += val;
    else if (tx.category === "Loan Lent") totalLent += val;
    else if (tx.category === "Debt Payment") totalDebtPayments += val;
    else if (tx.category === "Debt Repayment") totalDebtRepayments += val;

    // Include everything in total income & expense
    if (tx.type === "income") totalIncome += val;
    else if (tx.type === "expense") totalExpense += val;

    // Group transactions for breakdown
    if (!categoryTotals[tx.category]) {
      categoryTotals[tx.category] = { type: tx.type, amount: 0 };
    }
    categoryTotals[tx.category].amount += val;
  });

  const netBalance = totalIncome - totalExpense;
  const cashOnHandChange = allIncome - allExpense;

  // Category breakdown sorting
  const incomeBreakdown = Object.entries(categoryTotals)
    .filter(([_, data]) => data.type === "income")
    .map(([category, data]) => ({ category, amount: data.amount }))
    .sort((a, b) => b.amount - a.amount);

  const expenseBreakdown = Object.entries(categoryTotals)
    .filter(([_, data]) => data.type === "expense")
    .map(([category, data]) => ({ category, amount: data.amount }))
    .sort((a, b) => b.amount - a.amount);

  // Smart Insights generator
  const savingsRate =
    totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  const insights = [];

  if (transactions.length > 0) {
    // 1. Regular Cash Flow Profitability
    if (netBalance > 0) {
      insights.push({
        type: "success",
        title: "Net Profit Achieved",
        description: `Your earnings exceeded your expenses by ${formatNaira(netBalance)} in this period. Great job on keeping your budget positive!`,
      });
      if (savingsRate > 0) {
        insights.push({
          type: "success",
          title: "Healthy Savings Rate",
          description: `You saved ${savingsRate.toFixed(1)}% of your regular earnings in this period. Saving at least 20% is a great general goal.`,
        });
      }
    } else if (netBalance < 0) {
      insights.push({
        type: "danger",
        title: "Net Deficit (Overspending)",
        description: `You spent ${formatNaira(Math.abs(netBalance))} more than you earned in this period. Consider reviewing your top expense categories to reduce outgoings.`,
      });
    } else {
      insights.push({
        type: "warning",
        title: "Break-Even Period",
        description:
          "Your earnings and expenses were exactly equal. Try to create a buffer next month!",
      });
    }

    // 2. Liquidity / Cash on Hand Change
    if (cashOnHandChange !== netBalance) {
      insights.push({
        type: "info",
        title: "Cashflow vs. Net Worth discrepancy",
        description: `Your Net Balance change was ${formatNaira(netBalance)} but your actual Cash on Hand changed by ${formatNaira(cashOnHandChange)} due to debt/loan movements.`,
      });
    }

    // 3. Debts & Loans
    if (totalBorrowed > 0) {
      insights.push({
        type: "warning",
        title: "Borrowed Capital",
        description: `You borrowed a total of ${formatNaira(totalBorrowed)} in this period. Remember that this increases your available Cash on Hand today, but represents a liability that must be paid back.`,
      });
    }
    if (totalDebtPayments > 0) {
      insights.push({
        type: "success",
        title: "Liability Repayment",
        description: `You paid off ${formatNaira(totalDebtPayments)} of your outstanding debts in this period, strengthening your financial position.`,
      });
    }

    // 4. Heavy categories
    if (expenseBreakdown.length > 0) {
      const topExpense = expenseBreakdown[0];
      const percentOfTotal =
        totalExpense > 0 ? (topExpense.amount / totalExpense) * 100 : 0;
      insights.push({
        type: "info",
        title: `Top Expense: ${topExpense.category}`,
        description: `Your highest expenditure category was "${topExpense.category}" with ${formatNaira(topExpense.amount)}, which accounts for ${percentOfTotal.toFixed(1)}% of your regular expenses in this period.`,
      });
    }
  } else {
    insights.push({
      type: "info",
      title: "No Data Available",
      description:
        "Record transactions or debts in this period to receive financial insights.",
    });
  }

  return (
    <main>
      <Header
        title="Financial Evaluation"
        subtitle={`Evaluate your income, expenses, cashflows and loans from ${formatDateDisplay(startDate)} to ${formatDateDisplay(endDate)}.`}
        showRefresh={false}
        actions={
          <div className="px-4 py-2 rounded-2xl bg-zinc-900/60 border border-slate-800/80 text-xs sm:text-sm font-semibold text-slate-300 self-start sm:self-center">
            {formatDateDisplay(startDate)} — {formatDateDisplay(endDate)}
          </div>
        }
        stats={
          transactions.length > 0
            ? [
                {
                  title: "Cash Flow Change",
                  value: `${cashOnHandChange >= 0 ? "+" : "-"}${formatNaira(Math.abs(cashOnHandChange))}`,
                  icon: <Wallet className="size-5" />,
                  iconBg:
                    cashOnHandChange >= 0
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-rose-500/10 text-rose-400",
                  cardBg: "border-indigo-500/20 bg-indigo-950/20",
                  description: "Net physical cash added/spent",
                },
                {
                  title: "Net Balance (Earnings)",
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
              ]
            : undefined
        }
      />

      {/* Date Filter Component */}
      <div className="animate-in fade-in duration-500 delay-100">
        <EvaluationFilters
          initialStartDate={startDate}
          initialEndDate={endDate}
        />
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/10 min-h-[300px]">
          <Calendar className="size-12 text-slate-600 mb-3" />
          <p className="text-slate-400 text-base font-semibold">
            No transactions found in this date range.
          </p>
          <p className="text-slate-500 text-sm mt-1.5 max-w-md">
            Try adjusting your start and end dates above, or add new
            income/expenses and debts on the Dashboard.
          </p>
        </div>
      ) : (
        <>
          {/* Debts & Loans Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-in fade-in duration-500 delay-300">
            {/* Borrowed in Period */}
            <Card className="border border-slate-900 bg-zinc-950/40 rounded-3xl">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Borrowed (New)
                  </span>
                  <h4 className="text-lg font-bold mt-1 text-slate-200">
                    {formatNaira(totalBorrowed)}
                  </h4>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                  <ArrowDownRight className="size-4.5" />
                </div>
              </CardContent>
            </Card>

            {/* Lent in Period */}
            <Card className="border border-slate-900 bg-zinc-950/40 rounded-3xl">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Lent (New)
                  </span>
                  <h4 className="text-lg font-bold mt-1 text-slate-200">
                    {formatNaira(totalLent)}
                  </h4>
                </div>
                <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400">
                  <ArrowUpRight className="size-4.5" />
                </div>
              </CardContent>
            </Card>

            {/* Debt Repaid in Period */}
            <Card className="border border-slate-900 bg-zinc-950/40 rounded-3xl">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Paid Back to Others
                  </span>
                  <h4 className="text-lg font-bold mt-1 text-slate-200">
                    {formatNaira(totalDebtPayments)}
                  </h4>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <TrendingDown className="size-4.5" />
                </div>
              </CardContent>
            </Card>

            {/* Repayments Received in Period */}
            <Card className="border border-slate-900 bg-zinc-950/40 rounded-3xl">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Repayments Received
                  </span>
                  <h4 className="text-lg font-bold mt-1 text-slate-200">
                    {formatNaira(totalDebtRepayments)}
                  </h4>
                </div>
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <TrendingUp className="size-4.5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Evaluation Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Category Breakdowns (lg:span-8) */}
            <div className="lg:col-span-8 space-y-6 animate-in fade-in duration-500 delay-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Income Breakdown */}
                <div className="border border-slate-800/60 bg-slate-900/20 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-xl shadow-black/5 space-y-4">
                  <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                    <ArrowUpRight className="size-5 text-indigo-400" />
                    Income Breakdown
                  </h3>

                  {incomeBreakdown.length === 0 ? (
                    <p className="text-slate-500 text-sm">
                      No regular income recorded.
                    </p>
                  ) : (
                    <div className="space-y-4 pt-2">
                      {incomeBreakdown.map((item) => {
                        const percent =
                          totalIncome > 0
                            ? (item.amount / totalIncome) * 100
                            : 0;
                        return (
                          <div key={item.category} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span className="text-slate-300">
                                {item.category}
                              </span>
                              <span className="text-slate-400">
                                {formatNaira(item.amount)} ({percent.toFixed(1)}
                                %)
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-black border border-slate-900 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Expense Breakdown */}
                <div className="border border-slate-800/60 bg-slate-900/20 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-xl shadow-black/5 space-y-4">
                  <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                    <ArrowDownRight className="size-5 text-rose-400" />
                    Expense Breakdown
                  </h3>

                  {expenseBreakdown.length === 0 ? (
                    <p className="text-slate-500 text-sm">
                      No regular expenses recorded.
                    </p>
                  ) : (
                    <div className="space-y-4 pt-2">
                      {expenseBreakdown.map((item) => {
                        const percent =
                          totalExpense > 0
                            ? (item.amount / totalExpense) * 100
                            : 0;
                        return (
                          <div key={item.category} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span className="text-slate-300">
                                {item.category}
                              </span>
                              <span className="text-slate-400">
                                {formatNaira(item.amount)} ({percent.toFixed(1)}
                                %)
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-black border border-slate-900 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-rose-500 transition-all duration-500"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Smart Insights & Evaluation (lg:span-4) */}
            <div className="lg:col-span-4 space-y-6 animate-in fade-in duration-500 delay-400">
              <div className="border border-slate-800/60 bg-slate-900/20 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-xl shadow-black/5 space-y-4">
                <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <Sparkles className="size-5 text-amber-400 animate-pulse" />
                  Smart Evaluation Insights
                </h3>

                <div className="space-y-4 pt-2">
                  {insights.map((insight, idx) => {
                    const isSuccess = insight.type === "success";
                    const isDanger = insight.type === "danger";
                    const isWarning = insight.type === "warning";

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border flex gap-3 text-xs leading-relaxed ${
                          isSuccess
                            ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300"
                            : isDanger
                              ? "border-rose-500/20 bg-rose-500/5 text-rose-300"
                              : isWarning
                                ? "border-amber-500/20 bg-amber-500/5 text-amber-300"
                                : "border-slate-800 bg-slate-900/40 text-slate-300"
                        }`}
                      >
                        <Info
                          className={`size-4.5 shrink-0 mt-0.5 ${
                            isSuccess
                              ? "text-emerald-400"
                              : isDanger
                                ? "text-rose-400"
                                : isWarning
                                  ? "text-amber-400"
                                  : "text-slate-400"
                          }`}
                        />
                        <div className="space-y-1">
                          <h5 className="font-bold">{insight.title}</h5>
                          <p className="opacity-90">{insight.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

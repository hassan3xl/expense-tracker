import React from "react";
import { getSessionUser, getCurrentProject } from "@/lib/auth";
import { sql } from "@/lib/db";
import Header from "@/components/Header";
import EvaluationFilters from "@/components/evaluation/EvaluationFilters";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Calendar,
  Sparkles,
  Info,
  Layers,
  Scale,
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

  // Get active project strictly for current user / session
  const currentProj = await getCurrentProject(user.userId);

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
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Fetch transactions ONLY for the active project in date range
  const transactionsData = await sql`
    SELECT id, type, category, amount, description, date 
    FROM transactions 
    WHERE project_id = ${currentProj.id}
      AND date >= ${startDate + " 00:00:00"}
      AND date <= ${endDate + " 23:59:59"}
    ORDER BY date DESC
  `;

  // Fetch debts ONLY for the active project
  const debtsData = await sql`
    SELECT id, person, type, amount, remaining_amount, description, due_date, status, created_at 
    FROM debts 
    WHERE project_id = ${currentProj.id}
    ORDER BY created_at DESC
  `;

  const transactions = (transactionsData || []).map((tx) => ({
    id: Number(tx.id),
    type: String(tx.type),
    category: String(tx.category),
    amount: parseFloat(tx.amount || "0"),
    description: String(tx.description || ""),
    date: String(tx.date),
  }));

  const debts = (debtsData || []).map((d) => ({
    id: Number(d.id),
    person: String(d.person),
    type: String(d.type),
    amount: parseFloat(d.amount || "0"),
    remaining_amount: parseFloat(d.remaining_amount || "0"),
    description: String(d.description || ""),
    due_date: d.due_date ? String(d.due_date) : null,
    status: String(d.status),
    created_at: String(d.created_at),
  }));

  // Debt category definitions
  const DEBT_INFLOW_CATEGORIES = ["Loan Borrowed", "Debt Repayment"];
  const DEBT_OUTFLOW_CATEGORIES = ["Loan Lent", "Debt Payment"];

  // Metrics
  let earnedIncome = 0;
  let earnedIncomeCount = 0;

  let debtInflow = 0;
  let debtInflowCount = 0;

  let operatingExpense = 0;
  let operatingExpenseCount = 0;

  let debtOutflow = 0;
  let debtOutflowCount = 0;

  let totalBorrowed = 0;
  let borrowedCount = 0;

  let totalLent = 0;
  let lentCount = 0;

  let totalDebtPayments = 0;
  let debtPaymentsCount = 0;

  let totalDebtRepayments = 0;
  let debtRepaymentsCount = 0;

  const categoryTotals: Record<
    string,
    { type: string; amount: number; count: number }
  > = {};

  transactions.forEach((tx) => {
    const val = tx.amount;

    // Track specific debt transaction types
    if (tx.category === "Loan Borrowed") {
      totalBorrowed += val;
      borrowedCount++;
      debtInflow += val;
      debtInflowCount++;
    } else if (tx.category === "Debt Repayment") {
      totalDebtRepayments += val;
      debtRepaymentsCount++;
      debtInflow += val;
      debtInflowCount++;
    } else if (tx.type === "income") {
      earnedIncome += val;
      earnedIncomeCount++;
    }

    if (tx.category === "Loan Lent") {
      totalLent += val;
      lentCount++;
      debtOutflow += val;
      debtOutflowCount++;
    } else if (tx.category === "Debt Payment") {
      totalDebtPayments += val;
      debtPaymentsCount++;
      debtOutflow += val;
      debtOutflowCount++;
    } else if (tx.type === "expense") {
      operatingExpense += val;
      operatingExpenseCount++;
    }

    // Category breakdown grouping
    if (!categoryTotals[tx.category]) {
      categoryTotals[tx.category] = { type: tx.type, amount: 0, count: 0 };
    }
    categoryTotals[tx.category].amount += val;
    categoryTotals[tx.category].count += 1;
  });

  const totalCashIn = earnedIncome + debtInflow;
  const totalCashOut = operatingExpense + debtOutflow;

  const netProfit = earnedIncome - operatingExpense;
  const netCashFlow = totalCashIn - totalCashOut;

  const savingsRate =
    earnedIncome > 0
      ? ((earnedIncome - operatingExpense) / earnedIncome) * 100
      : 0;
  const expenseRatio =
    earnedIncome > 0 ? (operatingExpense / earnedIncome) * 100 : 0;

  // Active Project Debt Summary
  let activeOwedToMe = 0;
  let activeOwedByMe = 0;
  let activeLendCount = 0;
  let activeBorrowCount = 0;

  debts.forEach((d) => {
    if (d.status === "active") {
      if (d.type === "owed_to_me") {
        activeOwedToMe += d.remaining_amount;
        activeLendCount++;
      } else if (d.type === "owed_by_me") {
        activeOwedByMe += d.remaining_amount;
        activeBorrowCount++;
      }
    }
  });

  // Sorted Category Breakdowns
  const earnedIncomeBreakdown = Object.entries(categoryTotals)
    .filter(
      ([cat, data]) =>
        data.type === "income" && !DEBT_INFLOW_CATEGORIES.includes(cat),
    )
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
    }))
    .sort((a, b) => b.amount - a.amount);

  const debtInflowBreakdown = Object.entries(categoryTotals)
    .filter(
      ([cat, data]) =>
        data.type === "income" && DEBT_INFLOW_CATEGORIES.includes(cat),
    )
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
    }))
    .sort((a, b) => b.amount - a.amount);

  const operatingExpenseBreakdown = Object.entries(categoryTotals)
    .filter(
      ([cat, data]) =>
        data.type === "expense" && !DEBT_OUTFLOW_CATEGORIES.includes(cat),
    )
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
    }))
    .sort((a, b) => b.amount - a.amount);

  const debtOutflowBreakdown = Object.entries(categoryTotals)
    .filter(
      ([cat, data]) =>
        data.type === "expense" && DEBT_OUTFLOW_CATEGORIES.includes(cat),
    )
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Insights Generator
  const insights = [];

  if (transactions.length > 0) {
    if (netProfit > 0) {
      insights.push({
        type: "success",
        title: "Net Operational Profit",
        description: `Your earned income exceeded operating expenses by ${formatNaira(netProfit)}. You saved ${savingsRate.toFixed(1)}% of your earnings in this period.`,
      });
    } else if (netProfit < 0) {
      insights.push({
        type: "danger",
        title: "Operational Deficit",
        description: `Your operating expenses exceeded earned income by ${formatNaira(Math.abs(netProfit))}. Operating expenses represent ${expenseRatio.toFixed(1)}% of income.`,
      });
    } else {
      insights.push({
        type: "warning",
        title: "Break-Even Operational Status",
        description: `Earned income and operating expenses were equal at ${formatNaira(earnedIncome)}.`,
      });
    }

    if (Math.abs(netCashFlow - netProfit) > 0.01) {
      insights.push({
        type: "info",
        title: "Cash Flow vs Net Profit Variance",
        description: `Net Cash Flow is ${formatNaira(netCashFlow)} while Net Operational Profit is ${formatNaira(netProfit)}. The ${formatNaira(Math.abs(netCashFlow - netProfit))} variance is due to debt capital transactions (loans borrowed/lent or debt repayments).`,
      });
    }

    if (operatingExpenseBreakdown.length > 0) {
      const topExp = operatingExpenseBreakdown[0];
      const topPct =
        operatingExpense > 0 ? (topExp.amount / operatingExpense) * 100 : 0;
      insights.push({
        type: "info",
        title: `Top Operating Expense: ${topExp.category}`,
        description: `"${topExp.category}" represents your largest expenditure at ${formatNaira(topExp.amount)} (${topPct.toFixed(1)}% of operating expenses).`,
      });
    }

    if (activeOwedByMe > 0) {
      insights.push({
        type: "warning",
        title: "Project Debt Payable",
        description: `Project "${currentProj.name}" has ${formatNaira(activeOwedByMe)} in active outstanding debts owed to others across ${activeBorrowCount} record(s).`,
      });
    }
  } else {
    insights.push({
      type: "info",
      title: `No Activity in ${currentProj.name}`,
      description:
        "No transactions recorded for this project in the selected period.",
    });
  }

  return (
    <main className="space-y-6">
      {/* Header */}
      <Header
        title="Financial Evaluation"
        subtitle={`Period analysis for "${currentProj.name}" from ${formatDateDisplay(startDate)} to ${formatDateDisplay(endDate)}.`}
        showRefresh={false}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary flex items-center gap-1.5">
              <Layers className="size-3.5" />
              <span>Project: {currentProj.name}</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-card border border-border text-xs font-semibold text-muted-foreground">
              {formatDateDisplay(startDate)} — {formatDateDisplay(endDate)}
            </div>
          </div>
        }
        stats={
          transactions.length > 0
            ? [
                {
                  title: "Net Profit (Earned)",
                  value: `${netProfit >= 0 ? "+" : "-"}${formatNaira(Math.abs(netProfit))}`,
                  icon:
                    netProfit >= 0 ? (
                      <TrendingUp className="size-5" />
                    ) : (
                      <TrendingDown className="size-5" />
                    ),
                  iconBg:
                    netProfit >= 0
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-rose-500/10 text-rose-400",
                  cardBg:
                    netProfit >= 0
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-rose-500/20 bg-rose-500/5",
                  description: `${savingsRate.toFixed(1)}% profit margin on earned income`,
                },
                {
                  title: "Net Cash Flow",
                  value: `${netCashFlow >= 0 ? "+" : "-"}${formatNaira(Math.abs(netCashFlow))}`,
                  icon: <Wallet className="size-5" />,
                  iconBg:
                    netCashFlow >= 0
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-rose-500/10 text-rose-400",
                  description: `Inflows (${formatNaira(totalCashIn)}) - Outflows (${formatNaira(totalCashOut)})`,
                },
                {
                  title: "Earned Income",
                  value: formatNaira(earnedIncome),
                  icon: <ArrowUpRight className="size-5" />,
                  iconBg: "bg-primary/10 text-primary",
                  description: `${earnedIncomeCount} earned transaction${earnedIncomeCount === 1 ? "" : "s"}`,
                },
                {
                  title: "Operating Expenses",
                  value: formatNaira(operatingExpense),
                  icon: <ArrowDownRight className="size-5" />,
                  iconBg: "bg-rose-500/10 text-rose-400",
                  description: `${operatingExpenseCount} expense transaction${operatingExpenseCount === 1 ? "" : "s"}`,
                },
              ]
            : undefined
        }
      />

      {/* Date Filter Component */}
      <div>
        <EvaluationFilters
          initialStartDate={startDate}
          initialEndDate={endDate}
        />
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-3xl bg-card min-h-[300px]">
          <Calendar className="size-12 text-muted-foreground/60 mb-3" />
          <p className="text-muted-foreground text-base font-semibold">
            No transactions found for project "{currentProj.name}" in this date
            range.
          </p>
          <p className="text-muted-foreground/75 text-sm mt-1.5 max-w-md">
            Try adjusting your start and end dates above, or add new
            income/expenses and debts on the Dashboard.
          </p>
        </div>
      ) : (
        <>
          {/* Project Summary Banner */}
          <div className="p-4 sm:p-5 rounded-3xl border border-border bg-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <Scale className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">
                    Project Isolation Summary: {currentProj.name}
                  </h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Filtered
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Evaluated {transactions.length} transaction(s) and{" "}
                  {debts.length} debt record(s) strictly belonging to this
                  project.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground self-stretch md:self-auto justify-between border-t md:border-t-0 border-border pt-3 md:pt-0">
              <div>
                <span className="block text-[10px] text-muted-foreground/75 uppercase font-bold">
                  Project Receivable
                </span>
                <span className="text-foreground font-bold">
                  {formatNaira(activeOwedToMe)}
                </span>
              </div>
              <div className="h-8 w-px bg-border hidden md:block" />
              <div>
                <span className="block text-[10px] text-muted-foreground/75 uppercase font-bold">
                  Project Payable
                </span>
                <span className="text-foreground font-bold">
                  {formatNaira(activeOwedByMe)}
                </span>
              </div>
            </div>
          </div>

          {/* Debts & Loans Summary Grid (Detailed Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Borrowed in Period */}
            <Card className="border border-border bg-card text-card-foreground rounded-3xl overflow-hidden">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    Capital Borrowed
                  </span>
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                    <ArrowDownRight className="size-4.5" />
                  </div>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-foreground">
                    {formatNaira(totalBorrowed)}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {borrowedCount} transaction{borrowedCount === 1 ? "" : "s"}{" "}
                    in period
                  </p>
                </div>
                <div className="text-[11px] text-muted-foreground/80 border-t border-border/60 pt-2.5 leading-relaxed">
                  Cash inflow adding liability balance to be repaid.
                </div>
              </CardContent>
            </Card>

            {/* Lent in Period */}
            <Card className="border border-border bg-card text-card-foreground rounded-3xl overflow-hidden shadow-lg">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400/90 bg-violet-500/10 px-2.5 py-1 rounded-full border border-violet-500/20">
                    Capital Lent
                  </span>
                  <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
                    <ArrowUpRight className="size-4.5" />
                  </div>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-foreground">
                    {formatNaira(totalLent)}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {lentCount} transaction{lentCount === 1 ? "" : "s"} in
                    period
                  </p>
                </div>
                <div className="text-[11px] text-muted-foreground/80 border-t border-border/60 pt-2.5 leading-relaxed">
                  Cash outflow creating receivable asset to collect.
                </div>
              </CardContent>
            </Card>

            {/* Debt Repaid in Period */}
            <Card className="border border-border bg-card text-card-foreground rounded-3xl overflow-hidden shadow-lg">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/90 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Debts Paid Back
                  </span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <TrendingDown className="size-4.5" />
                  </div>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-foreground">
                    {formatNaira(totalDebtPayments)}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {debtPaymentsCount} payment transaction
                    {debtPaymentsCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="text-[11px] text-muted-foreground/80 border-t border-border/60 pt-2.5 leading-relaxed">
                  Outflow settling active borrowed debt liabilities.
                </div>
              </CardContent>
            </Card>

            {/* Repayments Received in Period */}
            <Card className="border border-border bg-card text-card-foreground rounded-3xl overflow-hidden shadow-lg">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary/90 bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                    Repayments Recovered
                  </span>
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <TrendingUp className="size-4.5" />
                  </div>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-foreground">
                    {formatNaira(totalDebtRepayments)}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {debtRepaymentsCount} repayment transaction
                    {debtRepaymentsCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="text-[11px] text-muted-foreground/80 border-t border-border/60 pt-2.5 leading-relaxed">
                  Inflow recovering principal lent out to borrowers.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Evaluation Breakdown Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Category Breakdowns (lg:span-8) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Earned Income Breakdown */}
                <div className="border border-border bg-card text-card-foreground rounded-3xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <ArrowUpRight className="size-5 text-primary" />
                      Earned Income Breakdown
                    </h3>
                    <span className="text-xs font-semibold text-primary">
                      {formatNaira(earnedIncome)}
                    </span>
                  </div>

                  {earnedIncomeBreakdown.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-4 text-center">
                      No regular earned income recorded in this period.
                    </p>
                  ) : (
                    <div className="space-y-4 pt-1">
                      {earnedIncomeBreakdown.map((item) => {
                        const percent =
                          earnedIncome > 0
                            ? (item.amount / earnedIncome) * 100
                            : 0;
                        return (
                          <div key={item.category} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span className="text-foreground flex items-center gap-1.5">
                                {item.category}
                                <span className="text-[10px] text-muted-foreground/80 font-normal">
                                  ({item.count} tx)
                                </span>
                              </span>
                              <span className="text-muted-foreground">
                                {formatNaira(item.amount)} ({percent.toFixed(1)}
                                %)
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-background border border-border overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Debt Inflows Sub-section if any */}
                  {debtInflowBreakdown.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-border space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Debt Capital Inflows (Not Earned)
                      </div>
                      {debtInflowBreakdown.map((item) => (
                        <div
                          key={item.category}
                          className="flex items-center justify-between text-xs py-1"
                        >
                          <span className="text-muted-foreground">
                            {item.category} ({item.count} tx)
                          </span>
                          <span className="font-semibold text-amber-400">
                            {formatNaira(item.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Operating Expense Breakdown */}
                <div className="border border-border bg-card text-card-foreground rounded-3xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <ArrowDownRight className="size-5 text-rose-400" />
                      Operating Expenses
                    </h3>
                    <span className="text-xs font-semibold text-rose-400">
                      {formatNaira(operatingExpense)}
                    </span>
                  </div>

                  {operatingExpenseBreakdown.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-4 text-center">
                      No operating expenses recorded in this period.
                    </p>
                  ) : (
                    <div className="space-y-4 pt-1">
                      {operatingExpenseBreakdown.map((item) => {
                        const percent =
                          operatingExpense > 0
                            ? (item.amount / operatingExpense) * 100
                            : 0;
                        return (
                          <div key={item.category} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span className="text-foreground flex items-center gap-1.5">
                                {item.category}
                                <span className="text-[10px] text-muted-foreground/80 font-normal">
                                  ({item.count} tx)
                                </span>
                              </span>
                              <span className="text-muted-foreground">
                                {formatNaira(item.amount)} ({percent.toFixed(1)}
                                %)
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-background border border-border overflow-hidden">
                              <div
                                className="h-full rounded-full bg-rose-500"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Debt Outflows Sub-section if any */}
                  {debtOutflowBreakdown.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-border space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Debt Capital Outflows (Non-Operating)
                      </div>
                      {debtOutflowBreakdown.map((item) => (
                        <div
                          key={item.category}
                          className="flex items-center justify-between text-xs py-1"
                        >
                          <span className="text-muted-foreground">
                            {item.category} ({item.count} tx)
                          </span>
                          <span className="font-semibold text-violet-400">
                            {formatNaira(item.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Smart Insights & Evaluation Sidebar (lg:span-4) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="border border-border bg-card text-card-foreground rounded-3xl p-5 sm:p-6 space-y-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="size-5 text-amber-400" />
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
                        className={`p-4 rounded-2xl border flex gap-3 text-xs leading-relaxed ${
                          isSuccess
                            ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300"
                            : isDanger
                              ? "border-rose-500/20 bg-rose-500/5 text-rose-300"
                              : isWarning
                                ? "border-amber-500/20 bg-amber-500/5 text-amber-300"
                                : "border-border bg-muted/40 text-muted-foreground"
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
                                  : "text-muted-foreground"
                          }`}
                        />
                        <div className="space-y-1">
                          <h5 className="font-bold text-sm">{insight.title}</h5>
                          <p className="opacity-90 leading-normal">
                            {insight.description}
                          </p>
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

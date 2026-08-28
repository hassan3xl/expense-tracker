"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart as PieChartIcon,
  Plus,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PageHeader } from "../ui/page-header";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useFinance } from "@/lib/finance-context";
import { DashboardSkeleton } from "@/components/loading/DashboardSkeleton";

export function OverviewTab() {
  const router = useRouter();
  const {
    accounts = [],
    transactions = [],
    setIsAddTransactionOpen,
    setIsAddAccountOpen,
    isInitialized,
  } = useFinance();

  if (!isInitialized) {
    return <DashboardSkeleton />;
  }

  // Calculations
  const totalNetWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const monthlyIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = monthlyIncome - monthlyExpenses;
  const savingsRate =
    monthlyIncome > 0
      ? Math.max(0, Math.round((netSavings / monthlyIncome) * 100))
      : 0;

  // Dynamic monthly chart data setup
  const now = new Date();
  const monthLabels: string[] = [];
  const monthMap = new Map<string, { income: number; expense: number }>();

  for (let i = 3; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString("default", { month: "short" });
    monthLabels.push(label);
    monthMap.set(label, { income: 0, expense: 0 });
  }

  transactions.forEach((tx) => {
    const txDate = new Date(tx.date);
    const label = txDate.toLocaleString("default", { month: "short" });
    if (monthMap.has(label)) {
      const current = monthMap.get(label)!;
      if (tx.type === "INCOME") current.income += tx.amount;
      if (tx.type === "EXPENSE") current.expense += tx.amount;
    }
  });

  const chartData = monthLabels.map((m) => ({
    month: m,
    income: monthMap.get(m)?.income || 0,
    expense: monthMap.get(m)?.expense || 0,
  }));

  // Dynamic Category Breakdown from actual expenses
  const categorySpendingMap = new Map<string, number>();
  transactions
    .filter((t) => t.type === "EXPENSE")
    .forEach((t) => {
      const name = t.categoryName || "Uncategorized";
      categorySpendingMap.set(
        name,
        (categorySpendingMap.get(name) || 0) + t.amount,
      );
    });

  const CATEGORY_COLORS = [
    "#f59e0b",
    "#ec4899",
    "#8b5cf6",
    "#3b82f6",
    "#06b6d4",
    "#10b981",
    "#64748b",
  ];

  const categoryBreakdown = Array.from(categorySpendingMap.entries()).map(
    ([name, value], idx) => ({
      name,
      value,
      color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
    }),
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Financial Overview"
        description="Track income, expenses, net worth, and recent activity."
        action={
          <Button
            onClick={() => setIsAddTransactionOpen(true)}
            variant="gradient"
            size="sm"
          >
            <Plus className="h-4 w-4" /> New Transaction
          </Button>
        }
      />
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Net Worth */}
        <Card className="glass-card glass-card-hover border-slate-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Net Worth
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Wallet className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-foreground tracking-tight">
              {formatCurrency(totalNetWorth)}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] text-muted-foreground">
                Total account balance
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Income */}
        <Card className="glass-card glass-card-hover border-slate-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Monthly Income
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
              <ArrowDownLeft className="h-4 w-4 text-teal-500 dark:text-teal-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-foreground tracking-tight">
              {formatCurrency(monthlyIncome)}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] text-muted-foreground">
                Logged income entries
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Expenses */}
        <Card className="glass-card glass-card-hover border-slate-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Monthly Expenses
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
              <ArrowUpRight className="h-4 w-4 text-rose-500 dark:text-rose-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-foreground tracking-tight">
              {formatCurrency(monthlyExpenses)}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] text-muted-foreground">
                Logged expense entries
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Savings Rate */}
        <Card className="glass-card glass-card-hover border-slate-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Savings Rate
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
              <TrendingUp className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-foreground tracking-tight">
              {savingsRate}%
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] text-emerald-500 dark:text-emerald-400 font-semibold">
                {netSavings >= 0 ? "+" : ""}
                {formatCurrency(netSavings)} saved
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Bar Chart */}
        <Card className="lg:col-span-2 glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Financial Overview</CardTitle>
              <p className="text-xs text-muted-foreground">
                Monthly cashflow breakdown
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/analytics")}
            >
              View Analytics
            </Button>
          </CardHeader>
          <CardContent className="h-72 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="month"
                  stroke="currentColor"
                  className="text-muted-foreground text-xs"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="currentColor"
                  className="text-muted-foreground text-xs"
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "12px",
                    color: "var(--foreground)",
                  }}
                />
                <Bar
                  dataKey="income"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  name="Income"
                />
                <Bar
                  dataKey="expense"
                  fill="#f43f5e"
                  radius={[6, 6, 0, 0]}
                  name="Expenses"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Category Breakdown */}
        <Card className="glass-card flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">Spending Breakdown</CardTitle>
            <p className="text-xs text-muted-foreground">
              Top categories this month
            </p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center">
            {categoryBreakdown.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted-foreground">
                <PieChartIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-60" />
                No expense transactions logged yet.
              </div>
            ) : (
              <>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          borderColor: "var(--border)",
                          borderRadius: "10px",
                          color: "var(--foreground)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full mt-2 text-xs">
                  {categoryBreakdown.slice(0, 4).map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-muted-foreground truncate">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Accounts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions Table */}
        <Card className="lg:col-span-2 glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Transactions</CardTitle>
              <p className="text-xs text-muted-foreground">
                Latest income and expense entries
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/transactions")}
            >
              See All
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                No transactions recorded yet. Click &quot;New Transaction&quot;
                to begin.
              </div>
            ) : (
              <>
                {/* Mobile View */}
                <div className="block md:hidden space-y-2.5">
                  {transactions.slice(0, 5).map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-xs sm:text-sm text-foreground truncate">
                          {tx.description}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                          <Badge
                            variant="secondary"
                            className="text-[9px] px-1.5 py-0"
                          >
                            {tx.categoryName || "General"}
                          </Badge>
                          <span>•</span>
                          <span className="truncate">
                            {tx.accountName || "Account"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div
                          className={`font-bold text-xs sm:text-sm ${
                            tx.type === "INCOME"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-foreground"
                          }`}
                        >
                          {tx.type === "INCOME" ? "+" : "-"}
                          {formatCurrency(tx.amount)}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {formatDate(tx.date)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.slice(0, 5).map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="font-semibold text-foreground">
                            {tx.description}
                            {tx.payee && (
                              <span className="block text-[11px] text-muted-foreground font-normal">
                                {tx.payee}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {tx.accountName || "Account"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-[11px]">
                              {tx.categoryName || "General"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDate(tx.date)}
                          </TableCell>
                          <TableCell
                            className={`text-right font-bold text-sm ${
                              tx.type === "INCOME"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-foreground"
                            }`}
                          >
                            {tx.type === "INCOME" ? "+" : "-"}
                            {formatCurrency(tx.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Accounts List */}
        <Card className="glass-card flex flex-col justify-between">
          <div>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Linked Accounts</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsAddAccountOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {accounts.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No accounts linked. Add an account to manage your balance.
                </div>
              ) : (
                accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 hover:border-emerald-500/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3.5 w-3.5 rounded-full"
                        style={{ backgroundColor: acc.color }}
                      />
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">
                          {acc.name}
                        </h4>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          {acc.accountNumber || acc.type}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        acc.balance < 0
                          ? "text-rose-500 dark:text-rose-400"
                          : "text-foreground"
                      }`}
                    >
                      {formatCurrency(acc.balance)}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </div>
          <div className="p-4 pt-4">
            <Button
              variant="outline"
              className="w-full text-xs"
              onClick={() => router.push("/accounts")}
            >
              Manage All Accounts
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

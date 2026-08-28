"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { formatCurrency } from "../../lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { useFinance } from "@/lib/finance-context";
import { PageHeader } from "../ui/page-header";
import { DashboardSkeleton } from "@/components/loading/DashboardSkeleton";

export function AnalyticsTab() {
  const { transactions = [], accounts = [], isInitialized } = useFinance();

  if (!isInitialized) {
    return <DashboardSkeleton />;
  }

  // Calculations
  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;

  const totalLiquidAssets = accounts
    .filter((a) => a.balance > 0)
    .reduce((sum, a) => sum + a.balance, 0);

  const totalLiabilities = Math.abs(
    accounts
      .filter((a) => a.balance < 0)
      .reduce((sum, a) => sum + a.balance, 0),
  );

  // Health Score calculation (0 to 100)
  let healthScore = 50;
  if (totalIncome > 0) {
    const savingsRatio = Math.max(0, netSavings / totalIncome);
    healthScore = Math.min(100, Math.round(50 + savingsRatio * 50));
  } else if (transactions.length === 0 && accounts.length === 0) {
    healthScore = 100;
  }

  // Emergency Fund Cover (Months)
  const emergencyFundMonths =
    totalExpense > 0
      ? (totalLiquidAssets / totalExpense).toFixed(1)
      : totalLiquidAssets > 0
        ? "12+"
        : "0";

  // Debt-to-Income Ratio
  const dtiRatio =
    totalIncome > 0
      ? ((totalLiabilities / totalIncome) * 100).toFixed(1)
      : "0.0";

  // Dynamic monthly cashflow trends from transactions
  const now = new Date();
  const monthMap = new Map<string, { income: number; expense: number }>();
  const monthLabels: string[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString("default", { month: "short" });
    monthLabels.push(label);
    monthMap.set(label, { income: 0, expense: 0 });
  }

  transactions.forEach((tx) => {
    const txDate = new Date(tx.date);
    const label = txDate.toLocaleString("default", { month: "short" });
    if (monthMap.has(label)) {
      const curr = monthMap.get(label)!;
      if (tx.type === "INCOME") curr.income += tx.amount;
      if (tx.type === "EXPENSE") curr.expense += tx.amount;
    }
  });

  const cashflowTrends = monthLabels.map((m) => {
    const data = monthMap.get(m) || { income: 0, expense: 0 };
    return {
      month: m,
      income: data.income,
      expense: data.expense,
      net: data.income - data.expense,
    };
  });

  // Dynamic Category Distribution
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

  const categoryDistribution = Array.from(categorySpendingMap.entries()).map(
    ([name, value], idx) => ({
      name,
      value,
      color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
    }),
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Analytics & Trends"
        description="Visualize cashflow trends, financial health scores, and spending breakdowns."
      />
      {/* Financial Health Scores Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground uppercase">
              Financial Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-400">
              {transactions.length === 0 && accounts.length === 0
                ? "N/A"
                : `${healthScore} / 100`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {transactions.length === 0
                ? "Add entries to compute score"
                : "Based on savings & cashflow ratio"}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground uppercase">
              Net Savings Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">
              {formatCurrency(netSavings)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Income minus expenses</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground uppercase">
              Emergency Fund Cover
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-teal-400">
              {emergencyFundMonths} Months
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Liquid assets vs expenses
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground uppercase">
              Debt-to-Income Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-cyan-400">
              {dtiRatio}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Liabilities vs income</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Trends Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">
            Cashflow & Savings Trend
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Monthly comparison of logged income vs expenses
          </p>
        </CardHeader>
        <CardContent className="h-80 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={cashflowTrends}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                stroke="currentColor"
                className="text-muted-foreground text-xs"
                fontSize={12}
                tickLine={false}
              />
              <YAxis stroke="currentColor" className="text-muted-foreground text-xs" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  borderRadius: "12px",
                  color: "var(--foreground)",
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#incomeGrad)"
                name="Income"
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#f43f5e"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#expenseGrad)"
                name="Expenses"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Spending Breakdown & Category Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">
              Expense Category Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex flex-col items-center justify-center">
            {categoryDistribution.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-8">
                <PieChartIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-60" />
                No expense transactions logged yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
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
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Top Monthly Spending</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex flex-col items-center justify-center">
            {categoryDistribution.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-8">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-60" />
                No expense categories to display.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryDistribution}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <XAxis
                    type="number"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "10px",
                      color: "#f8fafc",
                    }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

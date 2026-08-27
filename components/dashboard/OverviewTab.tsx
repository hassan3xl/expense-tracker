"use client";

import React from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
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
import { formatCurrency, formatDate } from "../../lib/utils";
import { AccountItem, BudgetItem, TransactionItem } from "../../lib/mock-data";
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

interface OverviewTabProps {
  accounts: AccountItem[];
  transactions: TransactionItem[];
  budgets: BudgetItem[];
  onOpenAddTransaction: () => void;
  onOpenAddAccount: () => void;
  setActiveTab: (tab: string) => void;
}

export function OverviewTab({
  accounts,
  transactions,
  budgets,
  onOpenAddTransaction,
  onOpenAddAccount,
  setActiveTab,
}: OverviewTabProps) {
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
    monthlyIncome > 0 ? Math.round((netSavings / monthlyIncome) * 100) : 0;

  // Chart data setup
  const chartData = [
    { month: "May", income: 3800, expense: 2100 },
    { month: "Jun", income: 4100, expense: 2450 },
    { month: "Jul", income: 3950, expense: 1980 },
    {
      month: "Aug",
      income: monthlyIncome || 4375,
      expense: monthlyExpenses || 1817,
    },
  ];

  const categoryBreakdown = [
    { name: "Housing", value: 1450, color: "#f59e0b" },
    { name: "Groceries", value: 420, color: "#ec4899" },
    { name: "Shopping", value: 220, color: "#8b5cf6" },
    { name: "Utilities", value: 88, color: "#3b82f6" },
    { name: "Other", value: 120, color: "#64748b" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Net Worth */}
        <Card className="glass-card glass-card-hover border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Net Worth
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Wallet className="h-4 w-4 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {formatCurrency(totalNetWorth)}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <Badge variant="income" className="gap-1 text-[11px] py-0">
                <TrendingUp className="h-3 w-3" /> +12.4%
              </Badge>
              <span className="text-[11px] text-slate-400">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Income */}
        <Card className="glass-card glass-card-hover border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Monthly Income
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
              <ArrowDownLeft className="h-4 w-4 text-teal-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {formatCurrency(monthlyIncome)}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <Badge variant="income" className="gap-1 text-[11px] py-0">
                <TrendingUp className="h-3 w-3" /> +4.2%
              </Badge>
              <span className="text-[11px] text-slate-400">
                Salary & side gigs
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Expenses */}
        <Card className="glass-card glass-card-hover border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Monthly Expenses
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
              <ArrowUpRight className="h-4 w-4 text-rose-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {formatCurrency(monthlyExpenses)}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <Badge variant="expense" className="gap-1 text-[11px] py-0">
                <TrendingDown className="h-3 w-3" /> -6.5%
              </Badge>
              <span className="text-[11px] text-slate-400">
                Under monthly target
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Savings Rate */}
        <Card className="glass-card glass-card-hover border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Savings Rate
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {savingsRate}%
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] text-emerald-400 font-semibold">
                +{formatCurrency(netSavings)} saved
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
              <p className="text-xs text-slate-400">
                Monthly cashflow breakdown
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("analytics")}
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
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#f8fafc",
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
            <p className="text-xs text-slate-400">Top categories this month</p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center">
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
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "10px",
                      color: "#f8fafc",
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
                  <span className="text-slate-400 truncate">{item.name}</span>
                </div>
              ))}
            </div>
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
              <p className="text-xs text-slate-400">
                Latest income and expense entries
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("transactions")}
            >
              See All
            </Button>
          </CardHeader>
          <CardContent>
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
                    <TableCell className="font-semibold text-white">
                      {tx.description}
                      {tx.payee && (
                        <span className="block text-[11px] text-slate-400 font-normal">
                          {tx.payee}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-300">
                      {tx.accountName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[11px]">
                        {tx.categoryName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-400">
                      {formatDate(tx.date)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold text-sm ${
                        tx.type === "INCOME"
                          ? "text-emerald-400"
                          : "text-slate-200"
                      }`}
                    >
                      {tx.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
                onClick={onOpenAddAccount}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: acc.color }}
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {acc.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {acc.accountNumber || acc.type}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      acc.balance < 0 ? "text-rose-400" : "text-slate-200"
                    }`}
                  >
                    {formatCurrency(acc.balance)}
                  </span>
                </div>
              ))}
            </CardContent>
          </div>
          <div className="p-4 pt-0">
            <Button
              variant="outline"
              className="w-full text-xs"
              onClick={() => setActiveTab("accounts")}
            >
              Manage All Accounts
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

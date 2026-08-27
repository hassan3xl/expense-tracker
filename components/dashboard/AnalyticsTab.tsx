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

const CASHFLOW_TRENDS = [
  { month: "Jan", income: 3500, expense: 2200, net: 1300 },
  { month: "Feb", income: 3600, expense: 2400, net: 1200 },
  { month: "Mar", income: 3800, expense: 2100, net: 1700 },
  { month: "Apr", income: 4200, expense: 2600, net: 1600 },
  { month: "May", income: 3900, expense: 2000, net: 1900 },
  { month: "Jun", income: 4500, expense: 2300, net: 2200 },
  { month: "Jul", income: 4300, expense: 1900, net: 2400 },
  { month: "Aug", income: 4800, expense: 2100, net: 2700 },
];

const CATEGORY_DISTRIBUTION = [
  { name: "Housing & Rent", value: 1450, color: "#f59e0b" },
  { name: "Groceries & Dining", value: 420, color: "#ec4899" },
  { name: "Shopping", value: 220, color: "#8b5cf6" },
  { name: "Utilities", value: 180, color: "#3b82f6" },
  { name: "Entertainment", value: 120, color: "#06b6d4" },
  { name: "Transportation", value: 95, color: "#64748b" },
];

export function AnalyticsTab() {
  return (
    <div className="space-y-6">
      {/* Financial Health Scores Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-slate-400 uppercase">
              Financial Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-400">
              92 / 100
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Excellent stability index
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-slate-400 uppercase">
              Average Monthly Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-white">
              {formatCurrency(1875)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Last 8 months average</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-slate-400 uppercase">
              Emergency Fund Cover
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-teal-400">
              6.8 Months
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Recommended is 3-6 mos
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-slate-400 uppercase">
              Debt-to-Income Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-cyan-400">14.5%</div>
            <p className="text-xs text-slate-400 mt-1">Low debt exposure</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Trends Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">
            Cashflow & Savings Trend (2026)
          </CardTitle>
          <p className="text-xs text-slate-400">
            Monthly comparison of income vs expenses
          </p>
        </CardHeader>
        <CardContent className="h-80 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={CASHFLOW_TRENDS}
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
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_DISTRIBUTION}
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {CATEGORY_DISTRIBUTION.map((entry, index) => (
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
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Top Monthly Spending</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={CATEGORY_DISTRIBUTION}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

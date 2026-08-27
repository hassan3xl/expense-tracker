"use client";

import React from "react";
import {
  Plus,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { formatCurrency, calculatePercentage } from "../../lib/utils";
import { useFinance } from "@/lib/finance-context";

export function BudgetsTab() {
  const { budgets = [], setIsAddBudgetOpen } = useFinance();

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);

  // Compute items crossing 50% and 80% thresholds
  const alerts50 = budgets.filter((b) => {
    const pct = calculatePercentage(b.spent, b.amount);
    return pct >= 50 && pct < 80;
  });

  const alerts80 = budgets.filter((b) => {
    const pct = calculatePercentage(b.spent, b.amount);
    return pct >= 80;
  });

  return (
    <div className="space-y-6">
      {/* Alert Monitor Header */}
      <Card className="glass-card border-emerald-500/30">
        <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400 shrink-0 mt-0.5 md:mt-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">
                  Automatic Budget Alert System
                </CardTitle>
                <Badge
                  variant="outline"
                  className="text-[10px] text-amber-400 border-amber-500/30"
                >
                  Uma & Bhuvana Alert Model
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Monitors category expenditures and automatically flags threshold
                alerts at 50% and 80% budget utilization.
              </p>
            </div>
          </div>
          <Button onClick={() => setIsAddBudgetOpen(true)} variant="gradient" size="sm">
            <Plus className="h-4 w-4" /> Add Budget
          </Button>
        </CardContent>
      </Card>

      {/* Active Threshold Alert Banners */}
      {alerts80.length > 0 && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <div>
            <span className="font-bold">80%+ Budget Threshold Alert:</span>{" "}
            Category spending has reached or exceeded 80% limit for{" "}
            {alerts80.map((b) => b.categoryName).join(", ")}.
          </div>
        </div>
      )}

      {alerts50.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold">50% Budget Utilization Notice:</span>{" "}
            Category spending reached 50% threshold for{" "}
            {alerts50.map((b) => b.categoryName).join(", ")}.
          </div>
        </div>
      )}

      {/* Budget Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Budgeted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(totalBudgeted)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Monthly cap across all categories
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-extrabold ${
                totalSpent > totalBudgeted
                  ? "text-rose-400"
                  : "text-emerald-400"
              }`}
            >
              {formatCurrency(totalSpent)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {formatCurrency(totalBudgeted - totalSpent)} remaining this month
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Monitored Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-teal-400">
              {budgets.length} Active Budgets
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time spending checks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Budget Progress Cards */}
      {budgets.length === 0 ? (
        <Card className="glass-card p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500 dark:text-amber-400">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Monthly Budgets Configured</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
              Set spending limits per category to automatically monitor expenditure thresholds (50% and 80%).
            </p>
          </div>
          <Button onClick={() => setIsAddBudgetOpen(true)} variant="gradient" size="sm">
            <Plus className="h-4 w-4" /> Create Your First Budget
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map((b) => {
            const percent = calculatePercentage(b.spent, b.amount);
            const isOver = b.spent > b.amount;
            const remaining = b.amount - b.spent;

            let statusBadge = (
              <Badge
                variant="default"
                className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              >
                Below 50%
              </Badge>
            );
            if (isOver) {
              statusBadge = <Badge variant="destructive">Exceeded (100%+)</Badge>;
            } else if (percent >= 80) {
              statusBadge = (
                <Badge
                  variant="secondary"
                  className="bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/40"
                >
                  80% Alert Threshold
                </Badge>
              );
            } else if (percent >= 50) {
              statusBadge = (
                <Badge
                  variant="secondary"
                  className="bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40"
                >
                  50% Notice Threshold
                </Badge>
              );
            }

            return (
              <Card key={b.id} className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3.5 w-3.5 rounded-full"
                      style={{ backgroundColor: b.categoryColor }}
                    />
                    <CardTitle className="text-base">{b.categoryName}</CardTitle>
                  </div>
                  {statusBadge}
                </CardHeader>

                <CardContent className="space-y-4 pt-2">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {formatCurrency(b.spent)}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                        {" "}
                        / {formatCurrency(b.amount)}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        isOver
                          ? "text-rose-400"
                          : percent >= 80
                            ? "text-rose-400"
                            : percent >= 50
                              ? "text-amber-400"
                              : "text-emerald-400"
                      }`}
                    >
                      {percent}%
                    </span>
                  </div>

                  <Progress
                    value={percent}
                    indicatorClassName={
                      isOver
                        ? "bg-rose-600"
                        : percent >= 80
                          ? "bg-rose-500"
                          : percent >= 50
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                    }
                  />

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    {isOver ? (
                      <span className="text-rose-400 flex items-center gap-1 font-semibold">
                        <AlertCircle className="h-3.5 w-3.5" /> Exceeded by{" "}
                        {formatCurrency(Math.abs(remaining))}
                      </span>
                    ) : percent >= 80 ? (
                      <span className="text-rose-400 flex items-center gap-1 font-semibold">
                        <AlertCircle className="h-3.5 w-3.5" /> 80% Threshold
                        Reached ({formatCurrency(remaining)} left)
                      </span>
                    ) : percent >= 50 ? (
                      <span className="text-amber-400 flex items-center gap-1 font-semibold">
                        <AlertTriangle className="h-3.5 w-3.5" /> 50% Threshold
                        Reached ({formatCurrency(remaining)} left)
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" />{" "}
                        {formatCurrency(remaining)} left to spend
                      </span>
                    )}
                    <span>Cap: {formatCurrency(b.amount)}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

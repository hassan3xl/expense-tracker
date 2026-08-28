"use client";

import React, { useState } from "react";
import {
  Plus,
  Target,
  Shield,
  Car,
  Plane,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import {
  formatCurrency,
  calculatePercentage,
  formatDate,
} from "../../lib/utils";
import { useFinance } from "@/lib/finance-context";
import { PageHeader } from "../ui/page-header";
import { DashboardSkeleton } from "@/components/loading/DashboardSkeleton";

export function GoalsTab() {
  const { goals = [], setIsAddGoalOpen, handleUpdateGoalDeposit, isInitialized } = useFinance();

  if (!isInitialized) {
    return <DashboardSkeleton />;
  }

  const [depositAmount, setDepositAmount] = useState<{ [id: string]: string }>(
    {},
  );

  const handleQuickDeposit = (id: string) => {
    const amt = parseFloat(depositAmount[id] || "0");
    if (!isNaN(amt) && amt > 0) {
      handleUpdateGoalDeposit(id, amt);
      setDepositAmount((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Savings Goals"
        description="Track progress towards long-term financial milestones."
        action={
          <Button
            onClick={() => setIsAddGoalOpen(true)}
            variant="gradient"
            size="sm"
          >
            <Plus className="h-4 w-4" /> New Savings Goal
          </Button>
        }
      />
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Saved for Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-emerald-400">
              {formatCurrency(totalSaved)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all active targets
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Target Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-foreground">
              {formatCurrency(totalTarget)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {calculatePercentage(totalSaved, totalTarget)}% overall progress
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card flex items-center justify-between p-6">
          <div>
            <CardTitle className="text-sm">Create New Goal</CardTitle>
            <p className="text-xs text-muted-foreground">Track major purchases</p>
          </div>
          <Button onClick={() => setIsAddGoalOpen(true)} variant="gradient" size="sm">
            <Plus className="h-4 w-4" /> New Goal
          </Button>
        </Card>
      </div>

      {/* Savings Goals Grid */}
      {goals.length === 0 ? (
        <Card className="glass-card p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 text-cyan-400">
            <Target className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">No Savings Goals Set</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              Track progress towards your long-term goals like emergency funds, home downpayments, or vacations.
            </p>
          </div>
          <Button onClick={() => setIsAddGoalOpen(true)} variant="gradient" size="sm">
            <Plus className="h-4 w-4" /> Create First Goal
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {goals.map((g) => {
            const percent = calculatePercentage(g.currentAmount, g.targetAmount);
            const isComplete = g.currentAmount >= g.targetAmount;

            return (
              <Card
                key={g.id}
                className="glass-card flex flex-col justify-between"
              >
                <div>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center border border-slate-700/60"
                        style={{
                          backgroundColor: `${g.color}15`,
                          color: g.color,
                        }}
                      >
                        {g.icon === "shield" && <Shield className="h-5 w-5" />}
                        {g.icon === "car" && <Car className="h-5 w-5" />}
                        {g.icon === "plane" && <Plane className="h-5 w-5" />}
                        {(!g.icon || g.icon === "target") && (
                          <Target className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-base">{g.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          Target: {formatDate(g.targetDate)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-2xl font-black text-foreground">
                          {formatCurrency(g.currentAmount)}
                        </span>
                        <span className="text-xs text-muted-foreground font-normal">
                          {" "}
                          / {formatCurrency(g.targetAmount)}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-emerald-500 dark:text-emerald-400">
                        {percent}%
                      </span>
                    </div>

                    <Progress
                      value={percent}
                      indicatorClassName="bg-gradient-to-r from-emerald-500 to-teal-400"
                    />

                    {isComplete ? (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-500 dark:text-emerald-400 font-semibold bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                        <CheckCircle className="h-4 w-4" /> Goal Completed!
                      </div>
                    ) : (
                      <div className="flex gap-2 pt-2">
                        <input
                          type="number"
                          placeholder="Deposit (₦)"
                          value={depositAmount[g.id] || ""}
                          onChange={(e) =>
                            setDepositAmount((prev) => ({
                              ...prev,
                              [g.id]: e.target.value,
                            }))
                          }
                          className="flex h-9 w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-xs text-foreground placeholder:text-muted-foreground"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-9 px-3 shrink-0"
                          onClick={() => handleQuickDeposit(g.id)}
                        >
                          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />{" "}
                          Save
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

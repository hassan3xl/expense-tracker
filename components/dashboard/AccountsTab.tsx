"use client";

import React from "react";
import {
  Plus,
  Wallet,
  CreditCard,
  Landmark,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { formatCurrency } from "../../lib/utils";
import { useFinance } from "@/lib/finance-context";

export function AccountsTab() {
  const { accounts = [], setIsAddAccountOpen } = useFinance();

  const totalAssets = accounts
    .filter((a) => a.balance > 0)
    .reduce((sum, a) => sum + a.balance, 0);

  const totalLiabilities = Math.abs(
    accounts
      .filter((a) => a.balance < 0)
      .reduce((sum, a) => sum + a.balance, 0),
  );

  return (
    <div className="space-y-6">
      {/* Account Overview Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-emerald-400">
              {formatCurrency(totalAssets)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Cash, savings, & investments
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Liabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-rose-400">
              {formatCurrency(totalLiabilities)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Credit cards & loans</p>
          </CardContent>
        </Card>

        <Card className="glass-card flex items-center justify-between p-6">
          <div>
            <CardTitle className="text-sm">Add New Account</CardTitle>
            <p className="text-xs text-slate-400">
              Connect card or bank account
            </p>
          </div>
          <Button onClick={() => setIsAddAccountOpen(true)} variant="gradient" size="sm">
            <Plus className="h-4 w-4" /> Add Account
          </Button>
        </Card>
      </div>

      {/* Account Cards Grid */}
      {accounts.length === 0 ? (
        <Card className="glass-card p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500 dark:text-emerald-400">
            <Wallet className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Linked Accounts Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
              Start by adding your bank account, checking, savings, cash, or credit card to track your live balance.
            </p>
          </div>
          <Button onClick={() => setIsAddAccountOpen(true)} variant="gradient" size="sm">
            <Plus className="h-4 w-4" /> Add Your First Account
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((acc) => (
            <Card
              key={acc.id}
              className="glass-card glass-card-hover border-slate-200 dark:border-zinc-800 relative overflow-hidden flex flex-col justify-between"
            >
              {/* Top color accent stripe */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: acc.color }}
              />

              <div>
                <CardHeader className="flex flex-row items-center justify-between pt-6">
                  <div>
                    <Badge
                      variant="secondary"
                      className="text-[10px] uppercase font-bold tracking-wider mb-1"
                    >
                      {acc.type.replace("_", " ")}
                    </Badge>
                    <CardTitle className="text-lg">{acc.name}</CardTitle>
                  </div>
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center border border-slate-200 dark:border-zinc-700/60"
                    style={{
                      backgroundColor: `${acc.color}15`,
                      color: acc.color,
                    }}
                  >
                    {acc.type === "CHECKING" && <Landmark className="h-5 w-5" />}
                    {acc.type === "SAVINGS" && <Wallet className="h-5 w-5" />}
                    {acc.type === "CREDIT_CARD" && (
                      <CreditCard className="h-5 w-5" />
                    )}
                    {acc.type === "INVESTMENT" && (
                      <TrendingUp className="h-5 w-5" />
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Current Balance
                    </span>
                    <div
                      className={`text-2xl font-black ${
                        acc.balance < 0 ? "text-rose-500 dark:text-rose-400" : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {formatCurrency(acc.balance)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800/80 text-xs text-slate-500 dark:text-slate-400">
                    <span>Account Number</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {acc.accountNumber || "•••• ----"}
                    </span>
                  </div>
                </CardContent>
              </div>

              <div className="p-4 pt-0">
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                  <ShieldCheck className="h-3.5 w-3.5" /> Synchronized with
                  User Account
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { UserButton, Show, SignInButton } from "@clerk/nextjs";
import { Plus, ShieldCheck, User } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface HeaderProps {
  onOpenAddTransaction: () => void;
  activeTab: string;
}

const TAB_TITLE_MAP: Record<string, { title: string; desc: string }> = {
  overview: {
    title: "Financial Overview",
    desc: "Track income, expenses, net worth, and recent activity.",
  },
  transactions: {
    title: "Transaction History",
    desc: "Search, filter, and manage all your income and expenses.",
  },
  accounts: {
    title: "Accounts & Assets",
    desc: "Manage checking, savings, credit cards, and investments.",
  },
  budgets: {
    title: "Monthly Budgets",
    desc: "Set spending caps per category and monitor your monthly progress.",
  },
  goals: {
    title: "Savings Goals",
    desc: "Track progress towards long-term financial milestones.",
  },
  analytics: {
    title: "Analytics & Insights",
    desc: "Visualize cashflow trends and category breakdowns.",
  },
};

export function Header({ onOpenAddTransaction, activeTab }: HeaderProps) {
  const current = TAB_TITLE_MAP[activeTab] || {
    title: "Finance Tracker",
    desc: "Manage your finances effortlessly.",
  };

  const isClerkConfigured =
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_live_") ||
      (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_test_") &&
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.length > 30));

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl px-6 py-4">
      {/* Title & Desc */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          {current.title}
        </h2>
        <p className="text-xs text-slate-400 font-normal">{current.desc}</p>
      </div>

      {/* Header Actions & Clerk Profile */}
      <div className="flex items-center gap-3">
        <Button
          onClick={onOpenAddTransaction}
          variant="gradient"
          size="sm"
          className="shadow-emerald-500/20"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>New Transaction</span>
        </Button>

        {/* Clerk Auth Integration */}
        <div className="pl-2 border-l border-slate-800 flex items-center gap-2">
          {isClerkConfigured ? (
            <>
              <Show when="signed-in">
                <UserButton />
              </Show>
              <Show when="signed-out">
                <SignInButton />
              </Show>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarFallback>
                  <User className="h-4 w-4 text-emerald-400" />
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                Demo User
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { UserButton, Show, SignInButton } from "@clerk/nextjs";
import { Plus, User, Menu } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { NotificationCenter } from "../notifications/NotificationCenter";
import { useFinance } from "@/lib/finance-context";

const ROUTE_TITLE_MAP: Record<string, { title: string; desc: string }> = {
  "/dashboard": {
    title: "Financial Overview",
    desc: "Track income, expenses, net worth, and recent activity.",
  },
  "/dashboard/transactions": {
    title: "Transaction History",
    desc: "Search, filter, and manage all your income and expenses.",
  },
  "/dashboard/categories": {
    title: "Category Management",
    desc: "Personalize and manage custom transaction categories.",
  },
  "/dashboard/budgets": {
    title: "Monthly Budgets",
    desc: "Set spending caps per category and monitor your monthly progress.",
  },
  "/dashboard/reports": {
    title: "Financial Reports",
    desc: "Export financial statements and filter custom date ranges.",
  },
  "/dashboard/accounts": {
    title: "Accounts & Assets",
    desc: "Manage checking, savings, credit cards, and investments.",
  },
  "/dashboard/goals": {
    title: "Savings Goals",
    desc: "Track progress towards long-term financial milestones.",
  },
  "/dashboard/profile": {
    title: "Profile & Security",
    desc: "Manage account settings, themes, and security practices.",
  },
  "/dashboard/analytics": {
    title: "Analytics & Insights",
    desc: "Visualize cashflow trends and category breakdowns.",
  },
};

export function Header() {
  const pathname = usePathname();
  const { setIsAddTransactionOpen, setIsMobileSidebarOpen } = useFinance();

  const current = ROUTE_TITLE_MAP[pathname] || {
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
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 dark:border-zinc-800/80 bg-white/80 dark:bg-black/80 backdrop-blur-xl px-4 sm:px-6 py-4 transition-colors">
      {/* Mobile Hamburger & Title */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileSidebarOpen((prev) => !prev)}
          className="lg:hidden h-9 w-9 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {current.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-normal hidden sm:block">
            {current.desc}
          </p>
        </div>
      </div>

      {/* Header Actions & Controls */}
      <div className="flex items-center gap-2">
        <Button
          onClick={() => setIsAddTransactionOpen(true)}
          variant="gradient"
          size="sm"
          className="shadow-emerald-500/20"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span className="hidden sm:inline">New Transaction</span>
        </Button>

        {/* Notification Center */}
        <NotificationCenter />

        {/* Clerk Auth Integration */}
        <div className="pl-2 border-l border-slate-200 dark:border-zinc-800 flex items-center gap-2">
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
                <AvatarFallback className="bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                  <User className="h-4 w-4 text-emerald-500" />
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-slate-600 dark:text-zinc-400 font-medium hidden sm:inline">
                Demo User
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

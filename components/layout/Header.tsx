"use client";

import React from "react";
import { UserButton, Show, SignInButton } from "@clerk/nextjs";
import { Plus, User, Menu, TrendingUp } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { NotificationCenter } from "../notifications/NotificationCenter";
import { useFinance } from "@/lib/finance-context";

export function Header() {
  const { setIsAddTransactionOpen, setIsMobileSidebarOpen } = useFinance();

  const isClerkConfigured =
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_live_") ||
      (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_test_") &&
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.length > 30));

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 dark:border-zinc-800/80 bg-white/80 dark:bg-black/80 backdrop-blur-xl px-3 sm:px-6 py-2.5 sm:py-3.5 transition-colors">
      {/* Left: Mobile Navigation Toggle & App Brand Logo */}
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
        <div className="flex items-center gap-2 lg:hidden">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
            <TrendingUp className="h-5 w-5 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
            Finance<span className="text-emerald-500 dark:text-emerald-400">Tracker</span>
          </span>
        </div>
      </div>

      {/* Right: Header Actions & Controls */}
      <div className="flex items-center gap-2">
        <Button
          onClick={() => setIsAddTransactionOpen(true)}
          variant="gradient"
          size="sm"
          className="shadow-emerald-500/20 text-xs sm:text-sm h-9"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span className="hidden sm:inline">New Transaction</span>
        </Button>

        {/* Notification Center */}
        <NotificationCenter />

        {/* User Profile / Auth */}
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
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
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

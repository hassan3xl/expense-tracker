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
    <header className="sticky top-0 z-30 w-full flex items-center justify-between border-b border-border/80 bg-background/80 backdrop-blur-xl px-3 sm:px-6 py-2.5 transition-all">
      {/* Left: Navigation Toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileSidebarOpen((prev) => !prev)}
          className="lg:hidden h-9 w-9 rounded-xl border border-border/60 bg-muted/50 hover:bg-muted text-foreground"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Right: Header Actions & Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        <Button
          onClick={() => setIsAddTransactionOpen(true)}
          variant="gradient"
          size="sm"
          className="h-8 sm:h-9 px-2.5 sm:px-3.5 text-xs sm:text-sm shadow-emerald-500/20 font-medium"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span className="hidden sm:inline">New Transaction</span>
        </Button>

        {/* Notification Center */}
        <NotificationCenter />

        {/* User Profile / Auth */}
        <div className="pl-1.5 sm:pl-2.5 border-l border-border/60 flex items-center gap-2">
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
                <AvatarFallback className="bg-muted border border-border/60">
                  <User className="h-4 w-4 text-emerald-500" />
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
                Demo User
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

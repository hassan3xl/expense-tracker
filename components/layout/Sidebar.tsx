"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  PieChart,
  Target,
  BarChart3,
  TrendingUp,
  Tag,
  FileText,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/transactions", label: "Transactions", icon: Receipt },
  { href: "/dashboard/categories", label: "Categories", icon: Tag },
  { href: "/dashboard/budgets", label: "Budgets & Alerts", icon: PieChart },
  { href: "/dashboard/reports", label: "Financial Reports", icon: FileText },
  { href: "/dashboard/accounts", label: "Accounts & Assets", icon: Wallet },
  { href: "/dashboard/goals", label: "Savings Goals", icon: Target },
  { href: "/dashboard/profile", label: "Profile & Security", icon: User },
  {
    href: "/dashboard/analytics",
    label: "Analytics & Trends",
    icon: BarChart3,
  },
];

export function Sidebar({ isOpenMobile, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  const SidebarContent = (
    <div className="flex flex-col h-full p-5">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-2 py-4 mb-4 border-b border-slate-200 dark:border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <TrendingUp className="h-6 w-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              Finance
              <span className="text-emerald-500 dark:text-emerald-400">
                Tracker
              </span>
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium tracking-wide uppercase">
              Expense & Budget System
            </p>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
            aria-label="Close Mobile Navigation"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto pr-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group text-left",
                isActive
                  ? "bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold shadow-sm"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900/80",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                  isActive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-300",
                )}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="w-64 shrink-0 hidden lg:flex flex-col border-r border-slate-200 dark:border-zinc-800/80 bg-white/90 dark:bg-black/90 backdrop-blur-xl min-h-screen transition-colors">
        {SidebarContent}
      </aside>

      {/* Mobile Slide-over Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer container */}
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 shadow-2xl transition-transform duration-300 ease-in-out">
            {SidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

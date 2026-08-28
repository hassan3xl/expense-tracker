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
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/categories", label: "Categories", icon: Tag },
  { href: "/budgets", label: "Budgets & Alerts", icon: PieChart },
  { href: "/reports", label: "Financial Reports", icon: FileText },
  { href: "/accounts", label: "Accounts & Assets", icon: Wallet },
  { href: "/goals", label: "Savings Goals", icon: Target },
  { href: "/profile", label: "Profile & Security", icon: User },
  {
    href: "/analytics",
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
    <div className="flex flex-col h-full p-4 sm:p-5">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-2 py-3.5 mb-4 border-b border-border/60">
        <div>
          <h1 className="font-extrabold text-xl tracking-tight text-foreground flex items-center gap-1.5">
            Finance
            <span className="text-emerald-500 dark:text-emerald-400">
              Tracker
            </span>
          </h1>
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close Navigation Menu"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
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
                "relative w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group text-left",
                isActive
                  ? "bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
              )}
            >
              {/* Active Left Indicator Strip */}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              )}

              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    "p-2 rounded-lg transition-colors shrink-0",
                    isActive
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : "bg-muted/50 text-muted-foreground group-hover:bg-muted group-hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 stroke-[2.2]" />
                </div>
                <span className="truncate">{item.label}</span>
              </div>

              <ChevronRight
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200",
                  isActive
                    ? "text-emerald-500 opacity-100 translate-x-0"
                    : "text-muted-foreground/40 opacity-0 -translate-x-1 group-hover:opacity-70 group-hover:translate-x-0",
                )}
              />
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Solid Sidebar */}
      <aside className="w-64 shrink-0 hidden lg:flex flex-col border-r border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 min-h-screen transition-colors">
        {SidebarContent}
      </aside>

      {/* Mobile Full-Screen Solid Navigation Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-[100] lg:hidden flex flex-col bg-white dark:bg-zinc-950 h-screen w-screen overflow-y-auto animate-in fade-in slide-in-from-left duration-200">
          {SidebarContent}
        </div>
      )}
    </>
  );
}

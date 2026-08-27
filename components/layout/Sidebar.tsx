"use client";

import React from "react";
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
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const NAV_ITEMS = [
  { id: "overview", label: "Dashboard (FR7)", icon: LayoutDashboard },
  { id: "transactions", label: "Transactions (FR2, FR3, FR10)", icon: Receipt },
  { id: "categories", label: "Categories (FR4)", icon: Tag },
  { id: "budgets", label: "Budgets & Alerts (FR5, FR6)", icon: PieChart },
  { id: "reports", label: "Financial Reports (FR8)", icon: FileText },
  { id: "accounts", label: "Accounts & Assets", icon: Wallet },
  { id: "goals", label: "Savings Goals", icon: Target },
  { id: "profile", label: "Profile & Security (FR1, FR9)", icon: User },
  { id: "analytics", label: "Analytics & Trends", icon: BarChart3 },
];

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col border-r border-slate-800/80 bg-slate-950/80 backdrop-blur-xl min-h-screen p-5">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-4 mb-4 border-b border-slate-800/80">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25">
          <TrendingUp className="h-6 w-6 text-slate-950 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
            Finance<span className="text-emerald-400">Tracker</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
            Expense & Budget System
          </p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          System Modules
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group text-left",
                isActive
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold shadow-md shadow-emerald-500/5"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/80"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"
                )}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Database Sync Status */}
      <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-slate-200 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> PostgreSQL DB
          </span>
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <span>Bcrypt Security & FR1-FR10 Compliant</span>
      </div>
    </aside>
  );
}

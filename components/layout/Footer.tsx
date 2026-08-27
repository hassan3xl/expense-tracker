"use client";

import React from "react";
import { TrendingUp } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-zinc-800/80 bg-white/90 dark:bg-black/90 backdrop-blur-xl mt-auto py-6 px-6 text-slate-500 dark:text-zinc-400 text-xs transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Element 1: Brand & Purpose */}
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20 shrink-0">
            <TrendingUp className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">
              Finance Tracker
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Web-based expense monitoring and budget management system.
            </p>
          </div>
        </div>

        {/* Element 2: Copyright & Rights Notice */}
        <div className="text-center sm:text-right text-[11px] text-slate-500 dark:text-zinc-400">
          <p className="font-medium">
            © {new Date().getFullYear()} Personal Finance Tracker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

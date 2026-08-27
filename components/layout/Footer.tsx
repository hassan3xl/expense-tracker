"use client";

import React from "react";
import { Github, Heart, ShieldCheck, TrendingUp, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-xl mt-auto py-8 px-6 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Purpose */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20 shrink-0">
            <TrendingUp className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white tracking-tight">
              Finance Tracker
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Web-based expense monitoring and budget management system.
            </p>
          </div>
        </div>

        {/* Academic / System Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Uma & Bhuvana (2026) Alert Model</span>
          </div>

          {/* GitHub Repository Link */}
          <a
            href="https://github.com/hasan/finance-tracker"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold transition-all shadow-sm group"
          >
            <Github className="h-4 w-4 text-slate-200 group-hover:text-white transition-transform group-hover:scale-110" />
            <span>GitHub Repository</span>
            <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100" />
          </a>
        </div>

        {/* Copyright */}
        <div className="text-center md:text-right text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} Finance Tracker. All rights reserved.</p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Built with Next.js (App Router), pnpm, Tailwind CSS & PostgreSQL
          </p>
        </div>
      </div>
    </footer>
  );
}

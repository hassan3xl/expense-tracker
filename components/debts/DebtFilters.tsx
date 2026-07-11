"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, Filter, X, Eye } from "lucide-react";

export default function DebtFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      updateUrl(search, type, status);
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  const updateUrl = (s: string, t: string, st: string) => {
    const params = new URLSearchParams();
    if (s) params.set("q", s);
    if (t) params.set("type", t);
    if (st) params.set("status", st);

    startTransition(() => {
      router.push(`/debts?${params.toString()}`);
    });
  };

  const handleTypeChange = (newType: string) => {
    setType(newType);
    updateUrl(search, newType, status);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    updateUrl(search, type, newStatus);
  };

  const handleReset = () => {
    setSearch("");
    setType("");
    setStatus("");
    startTransition(() => {
      router.push("/debts");
    });
  };

  const hasFilters = search || type || status;

  return (
    <div className="p-5 rounded-3xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-xl shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
            <Search className="size-4" />
          </span>
          <Input
            type="text"
            placeholder="Search by name, note, reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-black/45 border-slate-800 focus-visible:border-indigo-500/50 focus-visible:ring-indigo-500/10 text-slate-200"
          />
        </div>

        {/* Type Toggle Buttons */}
        <div className="flex p-1 rounded-2xl bg-black/60 border border-slate-800/60 self-start sm:self-auto shrink-0 items-center">
          <button
            onClick={() => handleTypeChange("")}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              type === ""
                ? "bg-slate-800 text-slate-200 border border-slate-700/50"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            All Loans
          </button>
          <button
            onClick={() => handleTypeChange("owed_by_me")}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              type === "owed_by_me"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Borrowed
          </button>
          <button
            onClick={() => handleTypeChange("owed_to_me")}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              type === "owed_to_me"
                ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Lent
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/40">
        {/* Status Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <Filter className="size-3.5" /> Debt Status:
          </span>
          <div className="relative flex-1 sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-500 z-10 pointer-events-none">
              <Eye className="size-3.5" />
            </span>
            <Input
              as="select"
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="pl-8 bg-black/45 border-slate-800 focus-visible:border-indigo-500/50 text-slate-200 h-10 rounded-xl text-xs"
            >
              <option value="" className="bg-slate-900 text-slate-400">
                All Statuses
              </option>
              <option value="active" className="bg-slate-900 text-slate-200">
                Active (Unresolved)
              </option>
              <option value="paid" className="bg-slate-900 text-slate-200">
                Paid (Resolved)
              </option>
            </Input>
          </div>
        </div>

        {/* Reset Filter Button */}
        {hasFilters && (
          <button
            onClick={handleReset}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition-all"
          >
            <X className="size-3.5" />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}

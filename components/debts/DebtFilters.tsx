"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X, Eye } from "lucide-react";
import {
  FilterCard,
  FilterGrid,
  FilterField,
  FilterInput,
  FilterSelect,
  FilterSegment,
  FilterButton,
} from "@/components/ui/FilterCard";

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
    <FilterCard>
      <FilterGrid>
        {/* Search Input */}
        <FilterField className="flex-grow">
          <FilterInput
            type="text"
            placeholder="Search by name, note, reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="size-4" />}
          />
        </FilterField>

        {/* Type Toggle Buttons */}
        <FilterSegment
          value={type}
          onChange={handleTypeChange}
          options={[
            { label: "All Loans", value: "" },
            {
              label: "Borrowed",
              value: "owed_by_me",
              activeColor: "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-xs",
            },
            {
              label: "Lent",
              value: "owed_to_me",
              activeColor: "bg-violet-500/10 text-violet-400 border border-violet-500/20 shadow-xs",
            },
          ]}
        />
      </FilterGrid>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/40">
        {/* Status Dropdown */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 select-none">
            <Filter className="size-3.5" /> Debt Status:
          </span>
          <div className="flex-1 sm:w-64">
            <FilterSelect
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              icon={<Eye className="size-3.5" />}
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
            </FilterSelect>
          </div>
        </div>

        {/* Reset Filter Button */}
        {hasFilters && (
          <FilterButton
            variant="danger"
            onClick={handleReset}
            disabled={isPending}
            className="h-10"
          >
            <X className="size-3.5" />
            Clear Filters
          </FilterButton>
        )}
      </div>
    </FilterCard>
  );
}

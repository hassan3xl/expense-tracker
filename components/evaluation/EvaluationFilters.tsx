'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Filter, Clock } from 'lucide-react';
import {
  FilterCard,
  FilterGrid,
  FilterField,
  FilterInput,
  FilterButton,
} from '@/components/ui/FilterCard';

interface EvaluationFiltersProps {
  initialStartDate: string;
  initialEndDate: string;
}

export default function EvaluationFilters({ initialStartDate, initialEndDate }: EvaluationFiltersProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [isPending, startTransition] = useTransition();

  const handleApply = (start = startDate, end = endDate) => {
    startTransition(() => {
      router.push(`/evaluation?startDate=${start}&endDate=${end}`);
    });
  };

  const handlePreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    
    setStartDate(startStr);
    setEndDate(endStr);
    handleApply(startStr, endStr);
  };

  const handleThisMonth = () => {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    
    setStartDate(startStr);
    setEndDate(endStr);
    handleApply(startStr, endStr);
  };

  return (
    <FilterCard>
      <FilterGrid>
        {/* Start Date */}
        <FilterField label="Start Date">
          <FilterInput
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            icon={<Calendar className="size-4" />}
          />
        </FilterField>

        {/* End Date */}
        <FilterField label="End Date">
          <FilterInput
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            icon={<Calendar className="size-4" />}
          />
        </FilterField>

        {/* Apply Button */}
        <FilterButton
          onClick={() => handleApply()}
          disabled={isPending}
          className="w-full md:w-auto shrink-0 h-11"
        >
          <Filter className="size-4" />
          {isPending ? 'Calculating...' : 'Evaluate Period'}
        </FilterButton>
      </FilterGrid>

      {/* Quick Presets */}
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/40">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5 mr-1 select-none">
          <Clock className="size-3.5" /> Quick Presets:
        </span>
        <button
          onClick={() => handlePreset(7)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 transition-all cursor-pointer"
        >
          Last 7 Days
        </button>
        <button
          onClick={() => handlePreset(30)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 transition-all cursor-pointer"
        >
          Last 30 Days
        </button>
        <button
          onClick={handleThisMonth}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 transition-all cursor-pointer"
        >
          This Month
        </button>
        <button
          onClick={() => handlePreset(90)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 transition-all cursor-pointer"
        >
          Last 90 Days
        </button>
      </div>
    </FilterCard>
  );
}

'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, Filter, Clock } from 'lucide-react';

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
    <div className="p-5 rounded-3xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-xl shadow-lg space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        {/* Start Date */}
        <div className="space-y-1.5 flex-1 w-full">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block ml-1">
            Start Date
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Calendar className="size-4" />
            </span>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="pl-9 bg-black/45 border-slate-800 focus-visible:border-indigo-500/50 focus-visible:ring-indigo-500/10 h-10 rounded-xl text-slate-200"
            />
          </div>
        </div>

        {/* End Date */}
        <div className="space-y-1.5 flex-1 w-full">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block ml-1">
            End Date
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Calendar className="size-4" />
            </span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="pl-9 bg-black/45 border-slate-800 focus-visible:border-indigo-500/50 focus-visible:ring-indigo-500/10 h-10 rounded-xl text-slate-200"
            />
          </div>
        </div>

        {/* Apply Button */}
        <Button
          onClick={() => handleApply()}
          disabled={isPending}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold h-10 px-6 rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-300 w-full md:w-auto"
        >
          <Filter className="size-4 mr-2" />
          {isPending ? 'Calculating...' : 'Evaluate Period'}
        </Button>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/40">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5 mr-1">
          <Clock className="size-3.5" /> Quick Presets:
        </span>
        <button
          onClick={() => handlePreset(7)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all cursor-pointer"
        >
          Last 7 Days
        </button>
        <button
          onClick={() => handlePreset(30)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all cursor-pointer"
        >
          Last 30 Days
        </button>
        <button
          onClick={handleThisMonth}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all cursor-pointer"
        >
          This Month
        </button>
        <button
          onClick={() => handlePreset(90)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all cursor-pointer"
        >
          Last 90 Days
        </button>
      </div>
    </div>
  );
}

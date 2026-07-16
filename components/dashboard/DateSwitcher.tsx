"use client";

import React, { useRef, useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar, RotateCcw } from "lucide-react";

interface DateSwitcherProps {
  initialDate: string;
}

export default function DateSwitcher({ initialDate }: DateSwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Set mounted on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const getLocalDateString = (d: Date) => {
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split("T")[0];
  };

  const todayStr = mounted ? getLocalDateString(new Date()) : initialDate;
  const selectedDateStr = searchParams.get("date") || initialDate;

  const navigateToDate = (dateStr: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", dateStr);
    startTransition(() => {
      router.push(`/dashboard?${params.toString()}`);
    });
  };

  if (!mounted) {
    return (
      <div className="h-10 w-48 bg-zinc-900/60 border border-slate-800/80 rounded-2xl animate-pulse shrink-0" />
    );
  }

  const handlePrevDay = () => {
    if (!selectedDateStr) return;
    const date = new Date(selectedDateStr);
    date.setDate(date.getDate() - 1);
    navigateToDate(getLocalDateString(date));
  };

  const handleNextDay = () => {
    if (!selectedDateStr) return;
    const date = new Date(selectedDateStr);
    date.setDate(date.getDate() + 1);
    navigateToDate(getLocalDateString(date));
  };

  const handleToday = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("date");
    startTransition(() => {
      router.push(`/dashboard?${params.toString()}`);
    });
  };

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      navigateToDate(e.target.value);
    }
  };

  const openDatePicker = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === "function") {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.click();
      }
    }
  };

  const getFormattedLabel = () => {
    if (!mounted || !selectedDateStr) return "Loading...";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(selectedDateStr);
    target.setHours(0, 0, 0, 0);

    // Calculate diff using timezone-safe UTC timestamps
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today, ${new Date(selectedDateStr).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })}`;
    }
    if (diffDays === -1) {
      return `Yesterday, ${new Date(selectedDateStr).toLocaleDateString(
        undefined,
        {
          month: "short",
          day: "numeric",
        },
      )}`;
    }
    if (diffDays === 1) {
      return `Tomorrow, ${new Date(selectedDateStr).toLocaleDateString(
        undefined,
        {
          month: "short",
          day: "numeric",
        },
      )}`;
    }

    return new Date(selectedDateStr).toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isToday = selectedDateStr === todayStr;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Date Switcher Container */}
      <div className="flex items-center rounded-2xl bg-card border border-border shadow-lg">
        {/* Prev Day Button */}
        <button
          onClick={handlePrevDay}
          disabled={isPending}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 transition-all duration-200 active:scale-95"
          aria-label="Previous day"
        >
          <ChevronLeft className="size-4 sm:size-5" />
        </button>

        {/* Selected Date Indicator / Picker Trigger */}
        <button
          onClick={openDatePicker}
          disabled={isPending}
          className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl hover:bg-muted text-xs sm:text-sm font-semibold text-foreground transition-all duration-200 active:scale-[0.98]"
        >
          <span>{getFormattedLabel()}</span>
        </button>

        {/* Next Day Button */}
        <button
          onClick={handleNextDay}
          disabled={isPending}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 transition-all duration-200 active:scale-95"
          aria-label="Next day"
        >
          <ChevronRight className="size-4 sm:size-5" />
        </button>

        {/* Hidden Date Input */}
        <input
          ref={dateInputRef}
          type="date"
          value={selectedDateStr}
          onChange={handleCustomDateChange}
          className="absolute opacity-0 pointer-events-none w-0 h-0"
        />
      </div>

      {/* Jump to Today Button */}
      {mounted && !isToday && (
        <button
          onClick={handleToday}
          disabled={isPending}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary text-xs font-semibold transition-all duration-200 active:scale-95"
        >
          <RotateCcw size={14} />
          <span>Today</span>
        </button>
      )}
    </div>
  );
}

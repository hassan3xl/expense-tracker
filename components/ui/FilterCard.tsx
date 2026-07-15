import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface FilterCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function FilterCard({ className, children, ...props }: FilterCardProps) {
  return (
    <div
      className={cn(
        "p-5 sm:p-6 rounded-3xl border border-slate-800/80 bg-zinc-900/30 backdrop-blur-xl shadow-xl shadow-black/20 space-y-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function FilterGrid({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col sm:flex-row gap-4 items-end", className)}>
      {children}
    </div>
  );
}

export function FilterField({
  label,
  children,
  className,
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5 flex flex-col w-full", className)}>
      {label && (
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block ml-1 select-none">
          {label}
        </label>
      )}
      <div className="relative w-full flex items-center">
        {children}
      </div>
    </div>
  );
}

export interface FilterInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  icon?: React.ReactNode;
}

export const FilterInput = React.forwardRef<HTMLInputElement, FilterInputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            "h-11 w-full rounded-xl border border-slate-850 bg-black/45 px-3.5 py-2 text-sm text-slate-200 placeholder:text-slate-500 transition-all outline-none focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/5",
            icon && "pl-10",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
FilterInput.displayName = "FilterInput";

export interface FilterSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: React.ReactNode;
}

export const FilterSelect = React.forwardRef<HTMLSelectElement, FilterSelectProps>(
  ({ className, icon, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none">
            {icon}
          </span>
        )}
        <select
          ref={ref}
          className={cn(
            "h-11 w-full appearance-none rounded-xl border border-slate-850 bg-black/45 px-3.5 py-2 pr-10 text-sm text-slate-200 cursor-pointer transition-all outline-none focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/5",
            icon && "pl-10",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-550 select-none opacity-80" />
      </div>
    );
  }
);
FilterSelect.displayName = "FilterSelect";

export interface FilterSegmentProps {
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string; activeColor?: string }[];
  className?: string;
}

export function FilterSegment({
  value,
  onChange,
  options,
  className,
}: FilterSegmentProps) {
  return (
    <div
      className={cn(
        "flex p-1 rounded-xl bg-black/50 border border-slate-850 items-center w-full sm:w-auto h-11 shrink-0",
        className
      )}
    >
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200 h-9 flex items-center justify-center cursor-pointer",
              isActive
                ? opt.activeColor || "bg-slate-800 text-slate-100 border border-slate-700/50 shadow-xs"
                : "text-slate-500 hover:text-slate-350 hover:bg-slate-900/30"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export interface FilterButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

export function FilterButton({
  className,
  variant = "primary",
  children,
  ...props
}: FilterButtonProps) {
  return (
    <button
      className={cn(
        "h-11 px-5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer select-none",
        variant === "primary" &&
          "bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-500/40 text-indigo-400 shadow-indigo-950/20 active:translate-y-px",
        variant === "secondary" &&
          "bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900/80 active:translate-y-px",
        variant === "danger" &&
          "bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 hover:border-rose-500/35 text-rose-400 active:translate-y-px",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

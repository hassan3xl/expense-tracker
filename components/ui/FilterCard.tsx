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
        "p-5 sm:p-6 rounded-3xl border border-border bg-card text-card-foreground shadow-xl shadow-black/20 space-y-4",
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
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block ml-1 select-none">
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
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            "h-11 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-all outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5",
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
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground pointer-events-none">
            {icon}
          </span>
        )}
        <select
          ref={ref}
          className={cn(
            "h-11 w-full appearance-none rounded-xl border border-border bg-background px-3.5 py-2 pr-10 text-sm text-foreground cursor-pointer transition-all outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5",
            icon && "pl-10",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground select-none opacity-80" />
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
        "flex p-1 rounded-xl bg-background border border-border items-center w-full sm:w-auto h-11 shrink-0",
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
                ? opt.activeColor || "bg-muted text-foreground border border-border shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
          "bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/40 text-primary active:translate-y-px",
        variant === "secondary" &&
          "bg-card border border-border hover:bg-muted text-foreground active:translate-y-px",
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

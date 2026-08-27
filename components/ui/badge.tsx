import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
        secondary:
          "border-transparent bg-slate-800 text-slate-300 border border-slate-700",
        destructive:
          "border-transparent bg-rose-500/15 text-rose-400 border border-rose-500/30",
        outline: "text-slate-200 border border-slate-700",
        income:
          "border-transparent bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
        expense:
          "border-transparent bg-rose-500/20 text-rose-300 border border-rose-500/40",
        transfer:
          "border-transparent bg-cyan-500/20 text-cyan-300 border border-cyan-500/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

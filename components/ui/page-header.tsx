import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-1 sm:pb-2",
        className
      )}
    >
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-2.5 shrink-0">{action}</div>
      )}
    </div>
  );
}

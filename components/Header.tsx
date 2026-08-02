"use client";

import React from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export interface StatCardData {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  iconBg?: string;
  cardBg?: string;
  description?: React.ReactNode;
}

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  stats?: StatCardData[];
  actions?: React.ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  showRefresh?: boolean;
  onRefresh?: () => void;
}

const StatCard = ({
  title,
  value,
  icon,
  trend,
  iconBg,
  cardBg,
  description,
}: StatCardData) => {
  return (
    <div
      className={`p-4 rounded-lg border border-border ${cardBg || "bg-card"}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div
            className={`p-2 rounded-md ${iconBg || "bg-muted text-muted-foreground"}`}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <div className="text-xl font-bold text-foreground truncate">
          {value}
        </div>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trend.isPositive ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {description && (
        <div className="text-xs text-muted-foreground mt-1.5">
          {description}
        </div>
      )}
    </div>
  );
};

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  stats,
  actions,
  showBackButton,
  onBack,
  showRefresh,
  onRefresh,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Header row */}
      {(title || showBackButton || actions || (showRefresh && onRefresh)) && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {showBackButton && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleBack}
                className="h-8 w-8 shrink-0"
                aria-label="Go back"
              >
                <ArrowLeft className="size-4" />
              </Button>
            )}
            {title && (
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-muted-foreground mt-0.5 hidden sm:block truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {actions}
            {showRefresh && onRefresh && (
              <Button
                variant="outline"
                size="icon"
                onClick={onRefresh}
                title="Refresh"
                className="h-8 w-8"
              >
                <RefreshCw className="size-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Stats grid */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Header;

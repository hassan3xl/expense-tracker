"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StatCardData {
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

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  showRefresh?: boolean;
  stats?: StatCardData[];
  actions?: React.ReactNode;
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
    <Card
      className={`group relative p-4 sm:p-6 rounded-3xl border overflow-hidden ${
        cardBg || "bg-card border-border"
      }`}
    >
      <CardContent className="p-0 flex flex-col h-full justify-between">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground truncate max-w-[70%] select-none">
            {title}
          </span>
          <div
            className={`p-1.5 sm:p-2.5 rounded-xl shrink-0 ${iconBg || "bg-muted"}`}
          >
            {icon}
          </div>
        </div>

        <div className="flex items-baseline justify-between mt-2">
          <div className="text-lg sm:text-2xl font-extrabold tracking-tight text-foreground truncate">
            {value}
          </div>
          {trend && (
            <div
              className={`flex items-center gap-0.5 text-[8px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                trend.isPositive
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/10"
              }`}
            >
              {trend.value}
            </div>
          )}
        </div>
        {description && (
          <div className="text-[10px] text-muted-foreground mt-1 select-none font-medium">
            {description}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onRefresh,
  showRefresh = true,
  stats,
  actions,
}) => {
  return (
    <div className="mb-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Left side - title/subtitle */}
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right side - actions */}
        <div className="flex items-center gap-2">
          {actions && <div className="flex items-center gap-2">{actions}</div>}
          {showRefresh && onRefresh && (
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              title="Refresh"
              className="hover:bg-accent hover:text-foreground transition-colors rounded-lg"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Stats Section */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Header;

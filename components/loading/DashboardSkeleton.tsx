"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner / Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-card border border-border/60 shadow-sm">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 sm:w-64" />
          <Skeleton className="h-4 w-72 sm:w-96" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* Statistics Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </CardHeader>
            <CardContent className="space-y-2 pt-2">
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-3.5 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Split Skeleton (Chart / List) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Card Skeleton */}
        <Card className="glass-card lg:col-span-2 space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3.5 w-60" />
            </div>
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
          <Skeleton className="h-64 sm:h-72 w-full rounded-xl" />
        </Card>

        {/* Side Panel / Breakdown Skeleton */}
        <Card className="glass-card space-y-4 p-6">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3.5 w-48" />
          </div>
          <div className="space-y-3 pt-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-border/40">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity Table Skeleton */}
      <Card className="glass-card space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3.5 w-64" />
          </div>
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>

        <div className="space-y-3 pt-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border border-border/50">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32 sm:w-48" />
                  <Skeleton className="h-3 w-20 sm:w-32" />
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-14" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export function Loader({
  size = "md",
  text,
  className,
  fullScreen = false,
}: LoaderProps) {
  const sizeMap = {
    sm: "h-5 w-5 border-2",
    md: "h-9 w-9 border-3",
    lg: "h-14 w-14 border-4",
  };

  const iconSizeMap = {
    sm: "h-3 w-3",
    md: "h-5 w-5",
    lg: "h-8 w-8",
  };

  const loaderContent = (
    <div className={cn("flex flex-col items-center justify-center gap-3 p-4 text-center", className)}>
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <div
          className={cn(
            "rounded-full border-emerald-500/20 border-t-emerald-500 animate-spin shadow-lg shadow-emerald-500/20",
            sizeMap[size]
          )}
        />
        {/* Inner Lucide Spinner */}
        <Loader2
          className={cn(
            "absolute text-emerald-500 animate-spin opacity-50",
            iconSizeMap[size]
          )}
        />
      </div>
      {text && (
        <p className="text-xs font-medium text-muted-foreground animate-pulse tracking-wide">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md transition-all">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
}

export function TopProgressBar({ isNavigating }: { isNavigating: boolean }) {
  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent overflow-hidden">
      <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 animate-pulse w-full origin-left transform transition-all duration-300 shadow-[0_0_10px_#10b981]" />
    </div>
  );
}

"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Reset when route transition completes
  useEffect(() => {
    setIsNavigating(false);
    setProgress(100);
    const timer = setTimeout(() => setProgress(0), 200);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Global click listener for standard link navigation
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("#") &&
        target.target !== "_blank" &&
        href !== pathname
      ) {
        setIsNavigating(true);
        setProgress(30);

        // Increment progress gradually
        const interval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(interval);
              return prev;
            }
            return prev + 15;
          });
        }, 100);

        setTimeout(() => clearInterval(interval), 3000);
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, [pathname]);

  if (!isNavigating && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-[0_0_12px_#10b981] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}

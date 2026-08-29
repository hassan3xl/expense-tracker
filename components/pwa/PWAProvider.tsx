"use client";

import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, Download, X, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "../ui/sonner";

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [showOnlineRestored, setShowOnlineRestored] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // 1. Initial Online status
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      if (!navigator.onLine) {
        setShowOfflineBanner(true);
      }
    }

    // 2. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service Worker registered successfully with scope:", reg.scope);
        })
        .catch((err) => {
          console.log("Service Worker registration failed:", err);
        });
    }

    // 3. Network Listeners for Online-First approach
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
      setShowOnlineRestored(true);
      toast.success("Connection Restored! Re-syncing live data from PostgreSQL...");
      
      // Auto-hide restored banner after 4 seconds
      setTimeout(() => {
        setShowOnlineRestored(false);
      }, 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
      setShowOnlineRestored(false);
      toast.error("Network connection lost. Running in Offline-First fallback mode.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // 4. Capture PWA beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      toast.success("Thank you for installing Pennywise!");
    }
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  return (
    <>
      {/* Top Banner 1: Offline Status Notification */}
      {showOfflineBanner && (
        <div className="bg-amber-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md z-[100] animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 shrink-0 animate-pulse" />
              <span>
                <strong>You are currently offline.</strong> Online-first PWA mode active — displaying cached financial data.
              </span>
            </div>
            <button
              onClick={() => setShowOfflineBanner(false)}
              className="text-amber-200 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Banner 2: Online Restored & Re-synced Notification */}
      {showOnlineRestored && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md z-[100] animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-200" />
              <span>
                <strong>Connection Restored!</strong> Online-first engine re-connected to live PostgreSQL database.
              </span>
            </div>
            <button
              onClick={() => setShowOnlineRestored(false)}
              className="text-emerald-200 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom PWA Install Prompt Banner */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 right-4 z-[90] max-w-sm w-full bg-slate-900/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-emerald-500/30 text-white p-4 rounded-2xl shadow-2xl space-y-3 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Install Pennywise App</h4>
                <p className="text-[11px] text-slate-300">
                  Install Pennywise for quick desktop & mobile access with online-first caching.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInstallPrompt(false)}
              className="text-xs text-slate-400 hover:text-white h-8"
            >
              Not Now
            </Button>
            <Button
              size="sm"
              onClick={handleInstallApp}
              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-8 gap-1.5 px-3"
            >
              <Download className="h-3.5 w-3.5" /> Install App
            </Button>
          </div>
        </div>
      )}

      {children}
    </>
  );
}

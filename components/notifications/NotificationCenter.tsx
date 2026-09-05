"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Trash2,
  X,
  Filter,
  Check,
} from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useFinance } from "@/lib/finance-context";
import { formatCurrency } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: "info" | "warning" | "success";
  time: string;
  read: boolean;
  category?: "system" | "alert" | "transaction";
}

function formatNotificationTime(timeStr?: string, id?: string): string {
  if (!timeStr) return "Today";

  let date: Date | null = null;

  if (timeStr && !isNaN(Date.parse(timeStr)) && timeStr.length > 10) {
    date = new Date(timeStr);
  } else if (id && id.startsWith("notif-")) {
    const timestampPart = id.split("-")[1];
    const ts = parseInt(timestampPart, 10);
    if (!isNaN(ts) && ts > 1000000000000) {
      date = new Date(ts);
    }
  }

  if (!date || isNaN(date.getTime())) {
    if (timeStr === "Active alert") return "Active alert";
    return timeStr || "Today";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60 && diffSecs >= 0) return "Just now";
  if (diffMins < 60 && diffMins > 0) return `${diffMins}m ago`;
  if (diffHours < 24 && diffHours > 0) return `${diffHours}h ago`;
  if (diffDays === 1) {
    return `Yesterday, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (diffDays < 7 && diffDays > 1) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationCenter() {
  const {
    accounts,
    budgets,
    transactions,
    notifications: userNotifications = [],
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  } = useFinance();

  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "unread" | "alerts">("all");

  const [readIds, setReadIds] = useState<string[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  // Load readIds and deletedIds from localStorage on mount
  useEffect(() => {
    try {
      const r = localStorage.getItem("user_read_notif_ids");
      if (r) setReadIds(JSON.parse(r));
      const d = localStorage.getItem("user_deleted_notif_ids");
      if (d) setDeletedIds(JSON.parse(d));
    } catch (e) {}
  }, []);

  const saveReadIds = (ids: string[]) => {
    setReadIds(ids);
    try {
      localStorage.setItem("user_read_notif_ids", JSON.stringify(ids));
    } catch (e) {}
  };

  const saveDeletedIds = (ids: string[]) => {
    setDeletedIds(ids);
    try {
      localStorage.setItem("user_deleted_notif_ids", JSON.stringify(ids));
    } catch (e) {}
  };

  // Combine real action notifications with dynamic live system alerts
  const [displayNotifications, setDisplayNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const rawList: NotificationItem[] = [...userNotifications];

    // 1. Low balance alert (< ₦5,000)
    if (accounts && accounts.length > 0) {
      accounts.forEach((acc) => {
        if (acc.balance < 5000 && acc.type !== "CREDIT_CARD") {
          rawList.push({
            id: `low-bal-${acc.id}`,
            title: `Low Balance: ${acc.name}`,
            body: `Current balance is ${formatCurrency(acc.balance)}. Consider topping up this account soon.`,
            type: "warning",
            time: "Active alert",
            read: false,
            category: "alert",
          });
        }
      });
    }

    // 2. Pending Expected Income Alert
    if (transactions && transactions.length > 0) {
      const pendingTxs = transactions.filter((t) => t.isPending);
      if (pendingTxs.length > 0) {
        const totalPending = pendingTxs.reduce((sum, t) => sum + t.amount, 0);
        rawList.push({
          id: "pending-invoices-alert",
          title: "Pending Expected Income",
          body: `You have ${pendingTxs.length} pending payments totaling ${formatCurrency(totalPending)}.`,
          type: "info",
          time: "Active alert",
          read: false,
          category: "alert",
        });
      }
    }

    // 3. Budget Limit Warning (> 80%)
    if (budgets && budgets.length > 0) {
      budgets.forEach((b) => {
        const percent = b.amount > 0 ? (b.spent / b.amount) * 100 : 0;
        if (percent >= 80) {
          rawList.push({
            id: `budget-warn-${b.id}`,
            title: `Budget Limit: ${b.categoryName}`,
            body: `You have spent ${percent.toFixed(0)}% of your allocated budget (${formatCurrency(b.spent)} / ${formatCurrency(b.amount)}).`,
            type: "warning",
            time: "Active alert",
            read: false,
            category: "alert",
          });
        }
      });
    }

    // Process read status and deleted filters
    const processed = rawList
      .filter((n) => !deletedIds.includes(n.id))
      .map((n) => ({
        ...n,
        read: n.read || readIds.includes(n.id),
      }));

    setDisplayNotifications(processed);
  }, [userNotifications, accounts, budgets, transactions, readIds, deletedIds]);

  const unreadCount = displayNotifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    markAllNotificationsRead();
    const allIds = displayNotifications.map((n) => n.id);
    const combined = Array.from(new Set([...readIds, ...allIds]));
    saveReadIds(combined);
  };

  const markSingleAsRead = (id: string) => {
    markNotificationRead(id);
    if (!readIds.includes(id)) {
      saveReadIds([...readIds, id]);
    }
  };

  const clearAllNotifications = () => {
    clearNotifications();
    const currentIds = displayNotifications.map((n) => n.id);
    const combined = Array.from(new Set([...deletedIds, ...currentIds]));
    saveDeletedIds(combined);
  };

  const filteredNotifications = displayNotifications.filter((n) => {
    if (filterType === "unread") return !n.read;
    if (filterType === "alerts") return n.category === "alert" || n.type === "warning";
    return true;
  });

  const renderContent = (isMobile: boolean = false) => (
    <div
      className="flex flex-col h-full w-full max-w-full overflow-hidden bg-white dark:bg-zinc-950 text-foreground"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header with explicit Close button & Delete icon */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/80 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 leading-none">
              Notifications
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {unreadCount > 0
                ? `${unreadCount} unread alert${unreadCount > 1 ? "s" : ""}`
                : "All notifications read"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                markAllAsRead();
              }}
              className="text-[11px] h-7 px-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-semibold"
            >
              Mark all read
            </Button>
          )}
          {displayNotifications.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                clearAllNotifications();
              }}
              className="h-8 w-8 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
              title="Delete all notifications"
              aria-label="Delete all notifications"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          {/* Explicit Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="h-8 w-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-zinc-800 dark:text-slate-400 dark:hover:text-white"
            aria-label="Close Notifications"
          >
            <X className="h-5 w-5 stroke-[2.5]" />
          </Button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 dark:border-zinc-800/60 text-[11px] shrink-0 bg-slate-50/50 dark:bg-zinc-900/30">
        <Filter className="h-3 w-3 text-muted-foreground" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            setFilterType("all");
          }}
          className={`px-2.5 py-0.5 rounded-md font-semibold transition-colors ${
            filterType === "all"
              ? "bg-emerald-500 text-white"
              : "bg-slate-200/60 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
          }`}
        >
          All ({displayNotifications.length})
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setFilterType("unread");
          }}
          className={`px-2.5 py-0.5 rounded-md font-semibold transition-colors ${
            filterType === "unread"
              ? "bg-emerald-500 text-white"
              : "bg-slate-200/60 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setFilterType("alerts");
          }}
          className={`px-2.5 py-0.5 rounded-md font-semibold transition-colors ${
            filterType === "alerts"
              ? "bg-amber-500 text-white"
              : "bg-slate-200/60 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
          }`}
        >
          Alerts
        </button>
      </div>

      {/* Notification Feed Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0">
        {filteredNotifications.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground flex flex-col items-center space-y-2">
            <Bell className="h-8 w-8 text-slate-300 dark:text-zinc-700" />
            <p>No notifications available.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={(e) => {
                e.stopPropagation();
                markSingleAsRead(notif.id);
              }}
              className={`p-3 rounded-xl transition-all border flex items-start gap-3 cursor-pointer ${
                !notif.read
                  ? "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30 shadow-sm"
                  : "bg-slate-50 dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {notif.type === "warning" && (
                  <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                )}
                {notif.type === "success" && (
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                )}
                {notif.type === "info" && (
                  <div className="h-7 w-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                    <Info className="h-4 w-4" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {formatNotificationTime(notif.time, notif.id)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                  {notif.body}
                </p>
                {!notif.read && (
                  <div className="pt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3 w-3" /> Tap to mark read
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mobile-only Bottom Close Button */}
      {isMobile && (
        <div className="p-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 shrink-0">
          <Button
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="w-full h-10 text-xs font-bold gap-2 border-slate-300 dark:border-zinc-700"
          >
            <X className="h-4 w-4" /> Close Notification Center
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-slate-600 dark:text-zinc-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-sm shadow-emerald-500/50 animate-pulse">
                {unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>

        {/* Desktop Floating Dropdown */}
        <PopoverContent
          align="end"
          onPointerDownOutside={(e) => e.preventDefault()}
          onFocusOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          className="hidden sm:block w-96 h-[520px] p-0 bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-2xl rounded-2xl overflow-hidden"
        >
          {renderContent(false)}
        </PopoverContent>
      </Popover>

      {/* Mobile Full Screen View */}
      {isOpen && (
        <div
          className="sm:hidden fixed inset-0 z-[100] w-full h-full min-h-dvh max-h-dvh bg-background flex flex-col overflow-hidden animate-in fade-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {renderContent(true)}
        </div>
      )}
    </>
  );
}

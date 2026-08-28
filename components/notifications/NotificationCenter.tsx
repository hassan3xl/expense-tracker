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

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-welcome",
    title: "Financial Engine Ready",
    body: "Personal finance tracker is live and connected to your database.",
    type: "success",
    time: "Just now",
    read: false,
    category: "system",
  },
  {
    id: "notif-qstack",
    title: "QStack Notification API",
    body: "Ready to dispatch instant push notifications via API Key.",
    type: "info",
    time: "5m ago",
    read: false,
    category: "system",
  },
];

export function NotificationCenter() {
  const { accounts, budgets, transactions } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    INITIAL_NOTIFICATIONS
  );
  const [filterType, setFilterType] = useState<"all" | "unread" | "alerts">("all");

  // Calculate dynamic auto-event notifications based on live financial state
  useEffect(() => {
    const dynamicNotifs: NotificationItem[] = [...INITIAL_NOTIFICATIONS];

    // 1. Low balance alert (< ₦5,000)
    if (accounts && accounts.length > 0) {
      accounts.forEach((acc) => {
        if (acc.balance < 5000 && acc.type !== "CREDIT_CARD") {
          dynamicNotifs.push({
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
        dynamicNotifs.push({
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
          dynamicNotifs.push({
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

    setNotifications(dynamicNotifs);
  }, [accounts, budgets, transactions]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markSingleAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === "unread") return !n.read;
    if (filterType === "alerts") return n.category === "alert" || n.type === "warning";
    return true;
  });

  const renderContent = (isMobile: boolean = false) => (
    <div
      className="flex flex-col h-full w-full max-w-full overflow-hidden bg-white dark:bg-zinc-950 text-foreground"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header with explicit Close button */}
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
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-[11px] h-7 px-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-semibold"
            >
              Mark all read
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
          onClick={() => setFilterType("all")}
          className={`px-2.5 py-0.5 rounded-md font-semibold transition-colors ${
            filterType === "all"
              ? "bg-emerald-500 text-white"
              : "bg-slate-200/60 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilterType("unread")}
          className={`px-2.5 py-0.5 rounded-md font-semibold transition-colors ${
            filterType === "unread"
              ? "bg-emerald-500 text-white"
              : "bg-slate-200/60 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilterType("alerts")}
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
              onClick={() => markSingleAsRead(notif.id)}
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
                    {notif.time}
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

      {/* Footer Actions: Delete Notifications */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-slate-200 dark:border-zinc-800 shrink-0 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
          <span className="text-[11px] text-muted-foreground font-medium">
            {notifications.length} total items
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllNotifications}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 h-7 gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete Notifications
          </Button>
        </div>
      )}

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

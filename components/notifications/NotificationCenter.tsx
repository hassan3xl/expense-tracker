"use client";

import React, { useState } from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Send,
  Info,
  Sparkles,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: "info" | "warning" | "success";
  time: string;
  read: boolean;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "System Notification Active",
    body: "Connected to QStack Notification Service using .env API Key.",
    type: "info",
    time: "Just now",
    read: false,
  },
  {
    id: "notif-2",
    title: "80% Budget Threshold Alert",
    body: "Housing & Rent spending reached 80% threshold (FR6 model).",
    type: "warning",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "notif-3",
    title: "Salary Deposit Received",
    body: "Monthly deposit of ₦4,250.00 logged into Main Checking.",
    type: "success",
    time: "1 day ago",
    read: true,
  },
];

export function NotificationCenter() {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS);
  const [isSending, setIsSending] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [statusMsg, setStatusMsg] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customBody) return;

    setIsSending(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: customTitle,
          body: customBody,
          channel: "admin",
          payload: { environment: "production" },
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatusMsg({
          text: "Notification sent via QStack API!",
          isError: false,
        });

        // Add to local notification feed
        const newNotif: NotificationItem = {
          id: `notif-${Date.now()}`,
          title: customTitle,
          body: customBody,
          type: "success",
          time: "Just now",
          read: false,
        };
        setNotifications((prev) => [newNotif, ...prev]);

        setCustomTitle("");
        setCustomBody("");
      } else {
        setStatusMsg({
          text: data.error || "Failed to dispatch notification.",
          isError: true,
        });
      }
    } catch (err) {
      setStatusMsg({
        text: "Network error sending notification.",
        isError: true,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 text-slate-600 dark:text-zinc-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-sm shadow-emerald-500/50">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 sm:w-96 p-0 bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-2xl rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Notifications & Alerts
            </h3>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-[11px] h-7 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
            >
              Mark all read
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="feed" className="w-full">
          <div className="px-3 pt-2">
            <TabsList className="grid grid-cols-2 w-full h-8 bg-slate-100 dark:bg-zinc-900 text-xs">
              <TabsTrigger value="feed" className="text-xs py-1">
                Alert Feed ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="send" className="text-xs py-1">
                QStack API Push
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Feed tab */}
          <TabsContent value="feed" className="p-0 mt-0">
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/60 p-2 space-y-1">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No notifications available
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-xl transition-colors flex items-start gap-3 ${
                      !notif.read
                        ? "bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10"
                        : "hover:bg-slate-50 dark:hover:bg-zinc-900/50"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {notif.type === "warning" && (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                      {notif.type === "success" && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      )}
                      {notif.type === "info" && (
                        <Info className="h-4 w-4 text-cyan-500" />
                      )}
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        {notif.body}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-2 border-t border-slate-100 dark:border-zinc-800/80 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-xs text-rose-500 hover:text-rose-600 h-7 gap-1"
                >
                  <Trash2 className="h-3 w-3" /> Clear feed
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Send via QStack Notification API */}
          <TabsContent value="send" className="p-3 mt-0 space-y-3">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-zinc-200 mb-0.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" /> QStack API
                Integration
              </div>
              Uses <code className="font-mono text-emerald-600 dark:text-emerald-400">QSTACK_NOTIFICATION_API_KEY</code> configured in environment file.
            </div>

            <form onSubmit={handleSendNotification} className="space-y-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                  Notification Title
                </label>
                <Input
                  placeholder="e.g. System Alert"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="h-8 text-xs bg-slate-50 dark:bg-zinc-900"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                  Message Body
                </label>
                <Input
                  placeholder="e.g. Version 2.4.0 is live"
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  className="h-8 text-xs bg-slate-50 dark:bg-zinc-900"
                  required
                />
              </div>

              {statusMsg && (
                <div
                  className={`p-2 rounded-lg text-xs flex items-center gap-1.5 ${
                    statusMsg.isError
                      ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                      : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  }`}
                >
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  <span>{statusMsg.text}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="gradient"
                size="sm"
                className="w-full h-8 text-xs gap-1.5"
                disabled={isSending}
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Dispatching...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" /> Send Push Alert
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}

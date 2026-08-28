"use client";

import React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  Coins,
  Trash2,
  Store,
  Wallet,
  Calendar,
  Tag,
  ArrowRight,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TransactionItem } from "@/lib/mock-data";

interface TransactionCardProps {
  transaction: TransactionItem;
  onCollect?: (tx: TransactionItem) => void;
  onTogglePending?: (id: string) => void;
  onDelete?: (id: string, name: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export function TransactionCard({
  transaction,
  onCollect,
  onTogglePending,
  onDelete,
  showActions = true,
  compact = false,
}: TransactionCardProps) {
  const {
    id,
    type,
    description,
    payee,
    amount,
    date,
    categoryName,
    accountName,
    toAccountName,
    isPending,
  } = transaction;

  const isIncome = type === "INCOME";
  const isExpense = type === "EXPENSE";
  const isTransfer = type === "TRANSFER";

  return (
    <div
      className={`group relative rounded-2xl bg-white/90 dark:bg-zinc-950/80 backdrop-blur-md border border-slate-200/90 dark:border-zinc-800/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
        isIncome
          ? "border-l-[6px] border-l-emerald-500 dark:border-l-emerald-400"
          : isExpense
            ? "border-l-[6px] border-l-rose-500 dark:border-l-rose-400"
            : "border-l-[6px] border-l-cyan-500 dark:border-l-cyan-400"
      } ${compact ? "p-3.5 space-y-2.5" : "p-4 sm:p-5 space-y-3.5"}`}
    >
      {/* Top Header: Icon + Info & Amount */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Type Circle Icon */}

          <div className="min-w-0 space-y-1">
            {/* Description / Main Title */}

            {/* Payee / Merchant Section (Prominently displayed) */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {payee ? (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-[11px] font-medium text-slate-700 dark:text-zinc-300">
                  <span className="font-semibold text-foreground truncate max-w-[160px] sm:max-w-[220px]">
                    {payee}
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Store className="h-3 w-3 text-slate-400 shrink-0" />
                  <span className="italic">No payee specified</span>
                </div>
              )}
            </div>
            <div className="font-bold text-sm sm:text-base text-foreground tracking-tight truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {description}
            </div>
          </div>
        </div>

        {/* Amount & Status Badge */}
        <div className="text-right shrink-0 space-y-1">
          <div
            className={`font-extrabold text-base sm:text-lg tracking-tight ${
              isIncome
                ? "text-emerald-600 dark:text-emerald-400"
                : isExpense
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-foreground"
            }`}
          >
            {isIncome ? "+" : isExpense ? "-" : ""}
            {formatCurrency(amount)}
          </div>

          {/* Pending vs Cleared Badge */}
          <div>
            {isPending ? (
              <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] sm:text-[11px] px-2 py-0.5 gap-1 font-semibold">
                <Clock className="h-3 w-3" /> Pending
              </Badge>
            ) : (
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] sm:text-[11px] px-2 py-0.5 font-medium gap-1">
                <CheckCircle2 className="h-3 w-3" /> Paid
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Middle Meta Details Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-zinc-900 text-xs text-muted-foreground">
        {/* Category */}
        <div className="flex items-center gap-1.5 min-w-0">
          <Tag className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate font-medium text-foreground">
            {categoryName || "General"}
          </span>
        </div>

        {/* Account Info */}
        <div className="flex items-center gap-1.5 min-w-0">
          <Wallet className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <div className="truncate font-medium text-foreground flex items-center gap-1">
            <span className="truncate">{accountName || "Account"}</span>
            {isTransfer && toAccountName && (
              <>
                <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                <span className="truncate text-cyan-600 dark:text-cyan-400">
                  {toAccountName}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="col-span-2 sm:col-span-1 flex items-center gap-1.5 min-w-0 font-mono text-[11px]">
          <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>{formatDate(date)}</span>
        </div>
      </div>

      {/* Bottom Action Controls */}
      {showActions && (onCollect || onTogglePending || onDelete) && (
        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-200/70 dark:border-zinc-800/70">
          <div className="flex items-center gap-2">
            {isPending && onCollect && (
              <Button
                size="sm"
                className="h-8 text-xs px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5 rounded-xl shadow-xs"
                onClick={() => onCollect(transaction)}
              >
                <Coins className="h-3.5 w-3.5" /> Collect Payment
              </Button>
            )}

            {/* {!isPending && onTogglePending && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs px-2.5 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 rounded-xl"
                onClick={() => onTogglePending(id)}
                title="Revert to Pending status"
              >
                Unpay
              </Button>
            )} */}

            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs px-2.5 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 gap-1 rounded-xl"
                onClick={() => onDelete(id, description)}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

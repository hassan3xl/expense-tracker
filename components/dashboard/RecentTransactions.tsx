"use client";

import React, { useState, useTransition } from "react";
import { deleteTransactionAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Tag,
  Calendar,
  ReceiptText,
} from "lucide-react";
import { toast } from "sonner";
import { formatNaira } from "@/lib/utils";

interface Transaction {
  id: number;
  type: string;
  category: string;
  amount: string;
  description: string;
  date: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  limit?: number;
  readOnly?: boolean;
}

export default function RecentTransactions({
  transactions,
  limit,
  readOnly = false,
}: RecentTransactionsProps) {
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (!deleteId) return;

    startTransition(async () => {
      try {
        await deleteTransactionAction(deleteId);
        toast.success("Transaction deleted successfully!");
        setDeleteId(null);
      } catch (err: any) {
        toast.error(err.message || "Failed to delete transaction");
      }
    });
  };

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/10">
        <ReceiptText className="size-8 text-slate-600 mb-2" />
        <p className="text-slate-400 text-sm font-medium">
          No transactions recorded yet.
        </p>
        <p className="text-slate-500 text-xs mt-1">
          Use the quick add form to record your first income or expense.
        </p>
      </div>
    );
  }

  const displayTransactions = limit
    ? transactions.slice(0, limit)
    : transactions;

  return (
    <div className="space-y-3">
      {displayTransactions.map((tx) => {
        const isIncome = tx.type === "income";
        const amount = parseFloat(tx.amount);
        const formattedDate = new Date(tx.date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        return (
          <div
            key={tx.id}
            className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-800/60 bg-slate-900/30 hover:bg-slate-900/50 hover:border-slate-800 transition-all duration-300 group"
          >
            {/* Left: Icon and Details */}
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center size-10 rounded-xl ${
                  isIncome
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                {isIncome ? (
                  <ArrowUpRight className="size-5" />
                ) : (
                  <ArrowDownRight className="size-5" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-200 truncate max-w-[150px] sm:max-w-[200px]">
                  {tx.description || tx.category}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-black/40 px-1.5 py-0.5 rounded-md border border-slate-900">
                    <Tag className="size-3 text-slate-500" />
                    {tx.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Amount and Delete */}
            <div className="flex items-center gap-3">
              <div>
                <span
                  className={`text-sm font-bold tracking-tight ${
                    isIncome ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isIncome ? "+" : "-"}
                  {formatNaira(amount)}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Calendar size={16} />
                  {formattedDate}
                </span>
              </div>
              {!readOnly && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleDelete(tx.id)}
                  disabled={isPending}
                  className="opacity-100 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-300"
                  title="Delete Transaction"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          </div>
        );
      })}

      <Dialog open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <DialogContent className="border border-slate-800 bg-slate-950/95 text-slate-100 max-w-sm rounded-3xl p-6">
          <DialogHeader className="flex flex-col items-center text-center gap-3">
            <div className="flex items-center justify-center size-12 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 mb-1">
              <Trash2 className="size-6" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-100">
              Delete Transaction
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              Are you sure you want to delete this transaction? This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              className="w-full sm:w-auto border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isPending}
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-500 text-white rounded-xl"
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { formatCurrency } from "@/lib/utils";
import { AccountItem, TransactionItem } from "@/lib/mock-data";
import { Coins, Wallet, Loader2 } from "lucide-react";

interface CollectPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionItem | null;
  accounts: AccountItem[];
  onConfirm: (
    transactionId: string,
    amountCollected: number,
    accountId: string
  ) => Promise<void>;
}

export function CollectPaymentModal({
  isOpen,
  onClose,
  transaction,
  accounts,
  onConfirm,
}: CollectPaymentModalProps) {
  const [collectedAmount, setCollectedAmount] = useState<string>("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (transaction) {
      setCollectedAmount(transaction.amount.toString());
      setSelectedAccountId(transaction.accountId || (accounts[0]?.id ?? ""));
      setErrorMsg(null);
    }
  }, [transaction, accounts]);

  if (!transaction) return null;

  const remainingAmount = transaction.amount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const parsed = parseFloat(collectedAmount);
    if (isNaN(parsed) || parsed <= 0) {
      setErrorMsg("Please enter a valid collection amount.");
      return;
    }

    if (parsed > remainingAmount) {
      setErrorMsg(
        `Collection amount cannot exceed remaining pending amount (${formatCurrency(
          remainingAmount
        )}).`
      );
      return;
    }

    if (!selectedAccountId) {
      setErrorMsg("Please select a target account to deposit funds.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirm(transaction.id, parsed, selectedAccountId);
      onClose();
    } catch (err) {
      setErrorMsg("Failed to process payment collection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Scrollable Body Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
              <Coins className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Collect Payment
              </span>
            </div>
            <DialogTitle className="text-lg font-bold">
              Receive Pending Payment
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Record full or partial collection for{" "}
              <span className="font-semibold text-foreground">
                "{transaction.description}"
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          {/* Pending Summary Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Total Remaining Pending:</span>
              <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                {formatCurrency(remainingAmount)}
              </span>
            </div>
          </div>

          <form id="collect-payment-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Amount to collect input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                <span>Amount to Collect Now</span>
                <button
                  type="button"
                  onClick={() => setCollectedAmount(remainingAmount.toString())}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                >
                  Collect Full ({formatCurrency(remainingAmount)})
                </button>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">
                  ₦
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={remainingAmount}
                  placeholder="0.00"
                  value={collectedAmount}
                  onChange={(e) => setCollectedAmount(e.target.value)}
                  className="pl-8 h-10 font-mono text-sm font-bold"
                  required
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Entering a partial amount leaves the remainder pending.
              </p>
            </div>

            {/* Target Account selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                <Wallet className="h-3.5 w-3.5 text-emerald-500" /> Deposit to Account
              </label>
              <Select
                value={selectedAccountId}
                onValueChange={setSelectedAccountId}
              >
                <SelectTrigger className="h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name} ({formatCurrency(acc.balance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 font-semibold">
                {errorMsg}
              </div>
            )}
          </form>
        </div>

        {/* Sticky Footer */}
        <DialogFooter className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 sm:flex-row gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-1/2 h-10 text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="collect-payment-form"
            variant="gradient"
            disabled={isSubmitting}
            className="w-full sm:w-1/2 h-10 text-xs font-bold gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <Coins className="h-4 w-4" /> Receive Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

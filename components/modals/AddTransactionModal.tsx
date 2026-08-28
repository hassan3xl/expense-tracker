"use client";

import React, { useState } from "react";
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
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  AccountItem,
  CategoryItem,
  TransactionItem,
} from "../../lib/mock-data";
import { ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: Omit<TransactionItem, "id">) => void;
  accounts: AccountItem[];
  categories: CategoryItem[];
}

export function AddTransactionModal({
  isOpen,
  onClose,
  onAddTransaction,
  accounts,
  categories,
}: AddTransactionModalProps) {
  const [type, setType] = useState<"INCOME" | "EXPENSE" | "TRANSFER">(
    "INCOME",
  );
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [toAccountId, setToAccountId] = useState(
    accounts[1]?.id || accounts[0]?.id || ""
  );
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [payee, setPayee] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isPending, setIsPending] = useState(false);

  React.useEffect(() => {
    if ((!accountId || !accounts.some((a) => a.id === accountId)) && accounts.length > 0) {
      setAccountId(accounts[0].id);
    }
    if ((!toAccountId || !accounts.some((a) => a.id === toAccountId)) && accounts.length > 0) {
      setToAccountId(accounts[1]?.id || accounts[0].id);
    }
  }, [accounts, accountId, toAccountId]);

  React.useEffect(() => {
    if ((!categoryId || !categories.some((c) => c.id === categoryId)) && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const effectiveAccountId = accountId || accounts[0]?.id || "";
  const selectedFromAccount = accounts.find((a) => a.id === effectiveAccountId);
  const selectedToAccount = accounts.find((a) => a.id === toAccountId);

  const parsedAmount = parseFloat(amount);
  const isInvalidAmount = amount !== "" && (isNaN(parsedAmount) || parsedAmount <= 0);
  const isInsufficient =
    type === "TRANSFER" &&
    selectedFromAccount &&
    !isNaN(parsedAmount) &&
    parsedAmount > selectedFromAccount.balance;
  const isSameAccount =
    type === "TRANSFER" && Boolean(accountId) && accountId === toAccountId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    if (isInsufficient || isSameAccount || isInvalidAmount) return;

    const account = accounts.find((a) => a.id === accountId);
    const toAccount = accounts.find((a) => a.id === toAccountId);
    const category = categories.find((c) => c.id === categoryId);

    onAddTransaction({
      accountId,
      accountName: account?.name || "Account",
      toAccountId: type === "TRANSFER" ? toAccountId : undefined,
      toAccountName: type === "TRANSFER" ? toAccount?.name : undefined,
      categoryId: type === "TRANSFER" ? undefined : categoryId,
      categoryName: type === "TRANSFER" ? "Transfer" : category?.name || "Uncategorized",
      categoryIcon: type === "TRANSFER" ? "refresh-cw" : category?.icon || "tag",
      amount: Math.abs(parseFloat(amount)),
      type,
      description: description || (type === "TRANSFER" ? `Transfer to ${toAccount?.name || "Account"}` : "Transaction"),
      date: date || new Date().toISOString().split("T")[0],
      payee,
      isPending: type === "INCOME" ? isPending : false,
    });

    // Reset fields
    setAmount("");
    setDescription("");
    setPayee("");
    setIsPending(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            <DialogHeader>
              <DialogTitle>Record New Transaction</DialogTitle>
              <DialogDescription>
                Enter details for your income, expense, or transfer.
              </DialogDescription>
            </DialogHeader>

            {/* Type selector toggle buttons (Income -> Expense -> Transfer) */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setType("INCOME")}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  type === "INCOME"
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <ArrowDownLeft className="h-3.5 w-3.5" /> Income
              </button>
              <button
                type="button"
                onClick={() => setType("EXPENSE")}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  type === "EXPENSE"
                    ? "bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/30"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <ArrowUpRight className="h-3.5 w-3.5" /> Expense
              </button>
              <button
                type="button"
                onClick={() => setType("TRANSFER")}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  type === "TRANSFER"
                    ? "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <RefreshCw className="h-3.5 w-3.5" /> Transfer
              </button>
            </div>

            {/* Explanation Box for Transfer */}
            {type === "TRANSFER" && (
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-700 dark:text-cyan-300 flex items-start gap-2.5 animate-in fade-in duration-200">
                <RefreshCw className="h-4 w-4 shrink-0 text-cyan-500 mt-0.5" />
                <div>
                  <span className="font-bold">What is a Transfer?</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    A transfer moves money between your own accounts. Select the source account first to verify available balance.
                  </p>
                </div>
              </div>
            )}

            {/* Account Selectors (Account selected FIRST) */}
            {type === "TRANSFER" ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>From Account</Label>
                    <Select value={accountId} onValueChange={setAccountId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>To Account</Label>
                    <Select value={toAccountId} onValueChange={setToAccountId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Available Balance Banner shown after selecting From Account */}
                {selectedFromAccount && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in">
                    <span className="font-medium">Available in {selectedFromAccount.name}:</span>
                    <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      ₦{selectedFromAccount.balance.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Account</Label>
                  <Select value={accountId} onValueChange={setAccountId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Amount (Positive only) */}
            <div className="space-y-1.5">
              <Label>Amount (₦)</Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="text-lg font-semibold"
              />
            </div>

            {/* Validation Error Displays */}
            {isInvalidAmount && (
              <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold animate-in fade-in">
                Transfer amount must be a positive number greater than ₦0.00.
              </div>
            )}
            {isInsufficient && (
              <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold animate-in fade-in">
                Insufficient funds! You only have ₦{selectedFromAccount?.balance.toLocaleString()} available in {selectedFromAccount?.name}.
              </div>
            )}
            {isSameAccount && (
              <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold animate-in fade-in">
                Source and destination accounts must be different.
              </div>
            )}

            {/* Description */}
            <div className="space-y-1.5">
              <Label>Description / Note</Label>
              <Input
                placeholder={type === "TRANSFER" ? "e.g. Move money to Savings" : "e.g. Grocery shopping, Salary payout"}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Payee & Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Payee / Merchant</Label>
                <Input
                  placeholder="e.g. Self, Amazon"
                  value={payee}
                  onChange={(e) => setPayee(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            {/* Pending Payment Toggle (Income only) */}
            {type === "INCOME" && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5 animate-in fade-in">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPending}
                    onChange={(e) => setIsPending(e.target.checked)}
                    className="h-4 w-4 rounded border-amber-500/40 text-amber-600 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                    Mark as Pending / Unpaid (Expected Income)
                  </span>
                </label>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 pl-6 leading-relaxed">
                  {isPending
                    ? "This transaction will be recorded under Expected Income and won't affect active account balance until marked as paid."
                    : "Check this if you haven't received payment yet (e.g. freelance work, pending invoice)."}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="w-full border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 dark:border-rose-500/30 dark:text-rose-400 font-semibold"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              className="w-full"
              disabled={Boolean(isInsufficient || isSameAccount || isInvalidAmount || !amount || parsedAmount <= 0)}
            >
              Save Transaction
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

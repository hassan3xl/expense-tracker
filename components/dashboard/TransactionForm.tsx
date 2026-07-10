"use client";

import React, { useState, useTransition } from "react";
import { addTransactionAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Tag,
  FileText,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investments",
  "Gifts",
  "Loan Borrowed",
  "Debt Repayment",
  "Other",
];
const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Rent & Housing",
  "Utilities",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Healthcare",
  "Loan Lent",
  "Debt Payment",
  "Other",
];

export default function TransactionForm() {
  const [type, setType] = useState<"income" | "expense">("income");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isPending, startTransition] = useTransition();

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // Auto-set first category when type changes
  React.useEffect(() => {
    setCategory(categories[0]);
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid positive amount.");
      return;
    }
    if (!category) {
      toast.error("Please select a category.");
      return;
    }

    startTransition(async () => {
      try {
        await addTransactionAction({
          type,
          category,
          amount: parseFloat(amount),
          description,
          date,
        });
        toast.success(
          `${type === "income" ? "Income" : "Expense"} recorded successfully!`,
        );
        setAmount("");
        setDescription("");
        setDate(new Date().toISOString().split("T")[0]);
      } catch (err: any) {
        toast.error(err.message || "Failed to save transaction");
      }
    });
  };

  return (
    <Card className="border border-slate-800/80 bg-slate-900/40 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl shadow-black/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <PlusCircle className="size-5 text-indigo-400" />
          Quick Add Transaction
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-black/60 border border-slate-800/50">
            <button
              type="button"
              onClick={() => setType("income")}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                type === "income"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30 border border-transparent"
              }`}
            >
              <ArrowUpRight className="size-4" />
              Income
            </button>
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                type === "expense"
                  ? "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30 border border-transparent"
              }`}
            >
              <ArrowDownRight className="size-4" />
              Expense
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block ml-1">
              Amount
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm font-bold text-slate-500 select-none">
                ₦
              </span>
              <Input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-9 bg-black/45 border-slate-800 focus-visible:border-indigo-500/50 focus-visible:ring-indigo-500/10 h-10 rounded-xl text-slate-200 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block ml-1">
                Category
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Tag className="size-4" />
                </span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-800 bg-black/45 pl-9 pr-3 text-sm text-slate-200 outline-none focus:border-indigo-500/50 focus:ring-3 focus:ring-indigo-500/10 transition-all duration-200 appearance-none"
                >
                  {categories.map((cat) => (
                    <option
                      key={cat}
                      value={cat}
                      className="bg-slate-900 text-slate-200"
                    >
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block ml-1">
                Date
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Calendar className="size-4" />
                </span>
                <Input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-9 bg-black/45 border-slate-800 focus-visible:border-indigo-500/50 focus-visible:ring-indigo-500/10 h-10 rounded-xl text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block ml-1">
              Description (Optional)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <FileText className="size-4" />
              </span>
              <Input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Grocery store purchase"
                className="pl-9 bg-black/45 border-slate-800 focus-visible:border-indigo-500/50 focus-visible:ring-indigo-500/10 h-10 rounded-xl text-slate-200"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold h-10 rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-300 mt-2"
          >
            {isPending ? "Saving..." : "Add Transaction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

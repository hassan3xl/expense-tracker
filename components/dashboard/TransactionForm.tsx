"use client";

import React, { useState, useTransition } from "react";
import { addTransactionAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
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
import { useSearchParams } from "next/navigation";
import { FilterInput, FilterSelect } from "@/components/ui/FilterCard";

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
  const searchParams = useSearchParams();
  const selectedDate = searchParams.get("date") || new Date().toISOString().split("T")[0];

  const [type, setType] = useState<"income" | "expense">("income");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(selectedDate);
  const [isPending, startTransition] = useTransition();

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // Auto-set first category when type changes
  React.useEffect(() => {
    setCategory(categories[0]);
  }, [type]);

  // Keep form date in sync when active day switcher date changes
  React.useEffect(() => {
    setDate(selectedDate);
  }, [selectedDate]);

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
        setDate(selectedDate);
      } catch (err: any) {
        toast.error(err.message || "Failed to save transaction");
      }
    });
  };

  return (
    <Card className="border border-slate-800/80 bg-zinc-900/30 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl shadow-black/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <PlusCircle className="size-5 text-indigo-400" />
          Quick Add Transaction
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-black/50 border border-slate-850 h-11 items-center">
            <button
              type="button"
              onClick={() => setType("income")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 h-9 cursor-pointer ${
                type === "income"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xs"
                  : "text-slate-500 hover:text-slate-350 hover:bg-slate-900/30 border border-transparent"
              }`}
            >
              <ArrowUpRight className="size-4" />
              Income
            </button>
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 h-9 cursor-pointer ${
                type === "expense"
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-xs"
                  : "text-slate-500 hover:text-slate-350 hover:bg-slate-900/30 border border-transparent"
              }`}
            >
              <ArrowDownRight className="size-4" />
              Expense
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block ml-1 select-none">
              Amount
            </label>
            <FilterInput
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              icon={<span className="text-sm font-bold text-slate-500 select-none">₦</span>}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block ml-1 select-none">
                Category
              </label>
              <FilterSelect
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                icon={<Tag className="size-4" />}
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
              </FilterSelect>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block ml-1 select-none">
                Date
              </label>
              <FilterInput
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                icon={<Calendar className="size-4" />}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block ml-1 select-none">
              Description (Optional)
            </label>
            <FilterInput
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Grocery store purchase"
              icon={<FileText className="size-4" />}
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-indigo-700 hover:bg-indigo-600 text-slate-100 font-semibold h-11 rounded-xl shadow-md shadow-indigo-950/20 transition-all duration-200 mt-2 cursor-pointer"
          >
            {isPending ? "Saving..." : "Add Transaction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

import React, { useState, useTransition } from "react";
import { addDebtAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Landmark, User, FileText, Calendar, Handshake } from "lucide-react";
import { toast } from "sonner";
import { FilterInput } from "@/components/ui/FilterCard";

export default function DebtForm() {
  const [type, setType] = useState<"owed_to_me" | "owed_by_me">("owed_by_me");
  const [person, setPerson] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!person.trim()) {
      toast.error("Please enter the name of the person.");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid positive amount.");
      return;
    }

    startTransition(async () => {
      try {
        await addDebtAction({
          person: person.trim(),
          type,
          amount: parseFloat(amount),
          description: description.trim(),
          due_date: dueDate || undefined,
        });
        toast.success(`Debt record with ${person} added successfully!`);
        setPerson("");
        setAmount("");
        setDescription("");
        setDueDate("");
      } catch (err: any) {
        toast.error(err.message || "Failed to save debt record");
      }
    });
  };

  return (
    <Card className="border border-slate-800/80 bg-zinc-900/70 rounded-3xl overflow-hidden shadow-xl shadow-black/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <Handshake className="size-5 text-indigo-400" />
          Quick Add Debt / Loan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-black/50 border border-slate-850 h-11 items-center">
            <button
              type="button"
              onClick={() => setType("owed_by_me")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 h-9 cursor-pointer ${
                type === "owed_by_me"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-xs"
                  : "text-slate-500 hover:text-slate-350 hover:bg-slate-900/30 border border-transparent"
              }`}
            >
              <Landmark className="size-4" />I Borrowed
            </button>
            <button
              type="button"
              onClick={() => setType("owed_to_me")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 h-9 cursor-pointer ${
                type === "owed_to_me"
                  ? "bg-violet-500/10 text-violet-400 border border-violet-500/20 shadow-xs"
                  : "text-slate-500 hover:text-slate-350 hover:bg-slate-900/30 border border-transparent"
              }`}
            >
              <Landmark className="size-4" />I Lent
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Person Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block ml-1 select-none">
                Person / Entity
              </label>
              <FilterInput
                type="text"
                required
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                placeholder="e.g., John Doe"
                icon={<User className="size-4" />}
              />
            </div>

            {/* Total Amount */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block ml-1 select-none">
                Loan Amount
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block ml-1 select-none">
                Reason / Note (Optional)
              </label>
              <FilterInput
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Dinner split"
                icon={<FileText className="size-4" />}
              />
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block ml-1 select-none">
                Due Date (Optional)
              </label>
              <FilterInput
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                icon={<Calendar className="size-4" />}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-indigo-700 hover:bg-indigo-600 text-slate-100 font-semibold h-11 rounded-xl shadow-md shadow-indigo-950/20 transition-all duration-200 mt-2 cursor-pointer"
          >
            {isPending ? "Saving..." : "Add Debt / Loan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

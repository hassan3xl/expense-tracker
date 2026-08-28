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
import { BudgetItem, CategoryItem } from "../../lib/mock-data";

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBudget: (b: Omit<BudgetItem, "id">) => void;
  categories: CategoryItem[];
}

export function AddBudgetModal({
  isOpen,
  onClose,
  onAddBudget,
  categories,
}: AddBudgetModalProps) {
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id || "");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

    const cat = categories.find((c) => c.id === categoryId);

    onAddBudget({
      categoryId,
      categoryName: cat?.name || "Category",
      categoryColor: cat?.color || "#ec4899",
      amount: parseFloat(amount),
      spent: 0,
      period: "MONTHLY",
    });

    setAmount("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Set Category Budget</DialogTitle>
          <DialogDescription>
            Define a spending cap for a specific category.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Monthly Spending Limit (₦)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g. 500.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 dark:border-rose-500/30 dark:text-rose-400 font-semibold"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gradient">
              Save Budget
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

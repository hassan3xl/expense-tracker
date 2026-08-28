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
import { GoalItem } from "../../lib/mock-data";

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGoal: (g: Omit<GoalItem, "id">) => void;
}

export function AddGoalModal({
  isOpen,
  onClose,
  onAddGoal,
}: AddGoalModalProps) {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [color, setColor] = useState("#10b981");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount || isNaN(Number(targetAmount))) return;

    onAddGoal({
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
      targetDate:
        targetDate ||
        new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
      color,
      icon: "target",
    });

    setName("");
    setTargetAmount("");
    setCurrentAmount("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Savings Goal</DialogTitle>
          <DialogDescription>
            Set a target amount and completion timeline.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            <div className="space-y-1.5">
              <Label>Goal Title</Label>
              <Input
                placeholder="e.g. House Down Payment, Vacation Fund"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Target Amount (₦)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="10000.00"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Current Saved (₦)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Target Completion Date</Label>
                <Input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Theme Color</Label>
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-11 p-1 cursor-pointer"
                />
              </div>
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
              Create Goal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { AccountItem } from "../../lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Trash2 } from "lucide-react";

interface EditAccountModalProps {
  account: AccountItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEditAccount: (id: string, updated: Partial<AccountItem>) => void;
  onDeleteAccount: (id: string) => void;
}

export function EditAccountModal({
  account,
  isOpen,
  onClose,
  onEditAccount,
  onDeleteAccount,
}: EditAccountModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountItem["type"]>("CHECKING");
  const [color, setColor] = useState("#3b82f6");

  useEffect(() => {
    if (account) {
      setName(account.name);
      setType(account.type);
      setColor(account.color || "#3b82f6");
    }
  }, [account]);

  if (!account) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onEditAccount(account.id, {
      name: name.trim(),
      type,
      color,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Account Details</DialogTitle>
          <DialogDescription>
            Update your account name, type, and accent color.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            <div className="space-y-1.5">
              <Label>Account Name</Label>
              <Input
                placeholder="e.g. Main Checking"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Account Type</Label>
                <Select
                  value={type}
                  onValueChange={(val) => setType(val as AccountItem["type"])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CHECKING">Checking</SelectItem>
                    <SelectItem value="SAVINGS">Savings</SelectItem>
                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                    <SelectItem value="INVESTMENT">Investment</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Card Accent Color</Label>
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 p-1 cursor-pointer w-full"
                />
              </div>
            </div>

            {/* Read-only balance display */}
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1">
              <Label className="text-xs text-muted-foreground">Current Account Balance (Read-Only)</Label>
              <div className="text-xl font-bold font-mono text-foreground">
                {formatCurrency(account.balance)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Account balance updates automatically when you record income, expense, or transfer transactions.
              </p>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between w-full">
            <Button
              type="button"
              variant="outline"
              className="border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 dark:border-rose-500/30 dark:text-rose-400 font-semibold gap-1.5"
              onClick={() => {
                onDeleteAccount(account.id);
                onClose();
              }}
            >
              <Trash2 className="h-4 w-4" /> Delete Account
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gradient">
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

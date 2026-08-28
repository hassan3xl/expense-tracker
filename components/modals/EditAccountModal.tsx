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
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle>Edit Account Details</DialogTitle>
                  <DialogDescription>
                    Update your account name, type, and accent color.
                  </DialogDescription>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 gap-1 text-xs"
                  onClick={() => {
                    onDeleteAccount(account.id);
                    onClose();
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </DialogHeader>

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
              <Label className="text-xs text-muted-foreground">Current Balance (Read-Only)</Label>
              <div className="text-xl font-bold font-mono text-foreground">
                {formatCurrency(account.balance)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Balance updates automatically when you record transactions.
              </p>
            </div>
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
            <Button type="submit" variant="gradient" className="w-full">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

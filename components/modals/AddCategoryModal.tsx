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
import { CategoryItem } from "@/lib/mock-data";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: CategoryItem | null;
  onSaveCategory: (cat: {
    name: string;
    type: "INCOME" | "EXPENSE";
    color: string;
    icon: string;
  }) => void;
}

export function AddCategoryModal({
  isOpen,
  onClose,
  categoryToEdit,
  onSaveCategory,
}: AddCategoryModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [color, setColor] = useState("#3b82f6");
  const [icon, setIcon] = useState("tag");

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setType(categoryToEdit.type as "INCOME" | "EXPENSE");
      setColor(categoryToEdit.color || "#3b82f6");
      setIcon(categoryToEdit.icon || "tag");
    } else {
      setName("");
      setType("EXPENSE");
      setColor("#3b82f6");
      setIcon("tag");
    }
  }, [categoryToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveCategory({
      name: name.trim(),
      type,
      color,
      icon,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          {/* Scrollable Container: Header + Description + Input Controls */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            <DialogHeader>
              <DialogTitle>
                {categoryToEdit ? "Edit Category" : "Create New Category"}
              </DialogTitle>
              <DialogDescription>
                Define personalized classification for your income or expenses.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-1.5">
              <Label>Category Name</Label>
              <Input
                placeholder="e.g. Subscriptions, Side Business"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Transaction Type</Label>
                <Select
                  value={type}
                  onValueChange={(v) => setType(v as "INCOME" | "EXPENSE")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                    <SelectItem value="INCOME">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Badge Accent Color</Label>
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 p-1 cursor-pointer w-full"
                />
              </div>
            </div>
          </div>

          {/* Sticky Bottom Footer: Side-by-Side Cancel and Save buttons */}
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
              {categoryToEdit ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

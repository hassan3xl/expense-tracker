"use client";

import React, { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { CategoryItem } from "../../lib/mock-data";
import { useFinance } from "@/lib/finance-context";
import { PageHeader } from "../ui/page-header";
import { DashboardSkeleton } from "@/components/loading/DashboardSkeleton";
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal";
import { AddCategoryModal } from "@/components/modals/AddCategoryModal";

export function CategoriesTab() {
  const {
    categories = [],
    handleAddCategory,
    handleEditCategory,
    handleDeleteCategory,
    isInitialized,
  } = useFinance();

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  if (!isInitialized) {
    return <DashboardSkeleton />;
  }

  const openAddModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleSaveCategory = (data: {
    name: string;
    type: "INCOME" | "EXPENSE";
    color: string;
    icon: string;
  }) => {
    if (editingCategory) {
      handleEditCategory(editingCategory.id, data);
    } else {
      handleAddCategory(data);
    }
  };

  const incomeCategories = categories.filter((c) => c.type === "INCOME");
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Category Management"
        description="Personalize and manage custom transaction categories."
        action={
          <Button onClick={openAddModal} variant="gradient" size="sm">
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        }
      />

      {/* Category Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Categories */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 dark:text-emerald-400 border border-emerald-500/20">
                <ArrowDownLeft className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base">Income Categories</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {incomeCategories.length} categories defined
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {incomeCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 hover:border-emerald-500/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-3.5 w-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-sm font-semibold text-foreground truncate">
                    {cat.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => openEditModal(cat)}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10"
                    onClick={() => setDeleteTarget({ id: cat.id, name: cat.name })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 dark:text-rose-400 border border-rose-500/20">
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base">Expense Categories</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {expenseCategories.length} categories defined
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {expenseCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 hover:border-emerald-500/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-3.5 w-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-sm font-semibold text-foreground truncate">
                    {cat.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => openEditModal(cat)}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10"
                    onClick={() => setDeleteTarget({ id: cat.id, name: cat.name })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Category Modal */}
      <AddCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoryToEdit={editingCategory}
        onSaveCategory={handleSaveCategory}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) handleDeleteCategory(deleteTarget.id);
        }}
        title="Delete Category"
        description="Are you sure you want to delete this category?"
        itemName={deleteTarget?.name}
      />
    </div>
  );
}

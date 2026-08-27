"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { TransactionsTab } from "@/components/dashboard/TransactionsTab";
import { AccountsTab } from "@/components/dashboard/AccountsTab";
import { BudgetsTab } from "@/components/dashboard/BudgetsTab";
import { GoalsTab } from "@/components/dashboard/GoalsTab";
import { AnalyticsTab } from "@/components/dashboard/AnalyticsTab";
import { CategoriesTab } from "@/components/dashboard/CategoriesTab";
import { ReportsTab } from "@/components/dashboard/ReportsTab";
import { ProfileTab } from "@/components/dashboard/ProfileTab";

import { AddTransactionModal } from "@/components/modals/AddTransactionModal";
import { AddAccountModal } from "@/components/modals/AddAccountModal";
import { AddBudgetModal } from "@/components/modals/AddBudgetModal";
import { AddGoalModal } from "@/components/modals/AddGoalModal";

import {
  INITIAL_ACCOUNTS,
  INITIAL_CATEGORIES,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_GOALS,
  AccountItem,
  CategoryItem,
  TransactionItem,
  BudgetItem,
  GoalItem,
} from "@/lib/mock-data";

export default function FinanceTrackerPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // State collections
  const [accounts, setAccounts] = useState<AccountItem[]>(INITIAL_ACCOUNTS);
  const [categories, setCategories] =
    useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [transactions, setTransactions] =
    useState<TransactionItem[]>(INITIAL_TRANSACTIONS);
  const [budgets, setBudgets] = useState<BudgetItem[]>(INITIAL_BUDGETS);
  const [goals, setGoals] = useState<GoalItem[]>(INITIAL_GOALS);

  // Modal open states
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);

  // Add Transaction (FR2, FR3)
  const handleAddTransaction = (newTx: Omit<TransactionItem, "id">) => {
    const txId = `tx-${Date.now()}`;
    const tx: TransactionItem = { id: txId, ...newTx };
    setTransactions((prev) => [tx, ...prev]);

    // Update account balance
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === newTx.accountId) {
          const delta = newTx.type === "INCOME" ? newTx.amount : -newTx.amount;
          return { ...acc, balance: acc.balance + delta };
        }
        return acc;
      }),
    );

    // Update budget spent if expense
    if (newTx.type === "EXPENSE" && newTx.categoryId) {
      setBudgets((prev) =>
        prev.map((b) => {
          if (b.categoryId === newTx.categoryId) {
            return { ...b, spent: b.spent + newTx.amount };
          }
          return b;
        }),
      );
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    setTransactions((prev) => prev.filter((t) => t.id !== id));

    // Revert account balance
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === tx.accountId) {
          const delta = tx.type === "INCOME" ? -tx.amount : tx.amount;
          return { ...acc, balance: acc.balance + delta };
        }
        return acc;
      }),
    );
  };

  // Category Management (FR4)
  const handleAddCategory = (newCat: Omit<CategoryItem, "id">) => {
    const cat: CategoryItem = { id: `cat-${Date.now()}`, ...newCat };
    setCategories((prev) => [...prev, cat]);
  };

  const handleEditCategory = (id: string, updated: Partial<CategoryItem>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c)),
    );
  };

  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Add Account
  const handleAddAccount = (newAcc: Omit<AccountItem, "id">) => {
    const acc: AccountItem = { id: `acc-${Date.now()}`, ...newAcc };
    setAccounts((prev) => [...prev, acc]);
  };

  // Add Budget (FR5)
  const handleAddBudget = (newB: Omit<BudgetItem, "id">) => {
    const b: BudgetItem = { id: `b-${Date.now()}`, ...newB };
    setBudgets((prev) => [...prev, b]);
  };

  // Add Goal
  const handleAddGoal = (newG: Omit<GoalItem, "id">) => {
    const g: GoalItem = { id: `g-${Date.now()}`, ...newG };
    setGoals((prev) => [...prev, g]);
  };

  // Update Goal deposit
  const handleUpdateGoalDeposit = (goalId: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          return { ...g, currentAmount: g.currentAmount + amount };
        }
        return g;
      }),
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenAddTransaction={() => setIsAddTransactionOpen(true)}
          activeTab={activeTab}
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === "overview" && (
            <OverviewTab
              accounts={accounts}
              transactions={transactions}
              budgets={budgets}
              onOpenAddTransaction={() => setIsAddTransactionOpen(true)}
              onOpenAddAccount={() => setIsAddAccountOpen(true)}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "transactions" && (
            <TransactionsTab
              transactions={transactions}
              accounts={accounts}
              categories={categories}
              onOpenAddTransaction={() => setIsAddTransactionOpen(true)}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {activeTab === "categories" && (
            <CategoriesTab
              categories={categories}
              onAddCategory={handleAddCategory}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {activeTab === "budgets" && (
            <BudgetsTab
              budgets={budgets}
              onOpenAddBudget={() => setIsAddBudgetOpen(true)}
            />
          )}

          {activeTab === "reports" && (
            <ReportsTab transactions={transactions} />
          )}

          {activeTab === "accounts" && (
            <AccountsTab
              accounts={accounts}
              onOpenAddAccount={() => setIsAddAccountOpen(true)}
            />
          )}

          {activeTab === "goals" && (
            <GoalsTab
              goals={goals}
              onOpenAddGoal={() => setIsAddGoalOpen(true)}
              onUpdateGoalDeposit={handleUpdateGoalDeposit}
            />
          )}

          {activeTab === "profile" && <ProfileTab />}

          {activeTab === "analytics" && <AnalyticsTab />}
        </main>

        {/* System Footer */}
        <Footer />
      </div>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddTransactionOpen}
        onClose={() => setIsAddTransactionOpen(false)}
        onAddTransaction={handleAddTransaction}
        accounts={accounts}
        categories={categories}
      />

      <AddAccountModal
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
        onAddAccount={handleAddAccount}
      />

      <AddBudgetModal
        isOpen={isAddBudgetOpen}
        onClose={() => setIsAddBudgetOpen(false)}
        onAddBudget={handleAddBudget}
        categories={categories}
      />

      <AddGoalModal
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
        onAddGoal={handleAddGoal}
      />
    </div>
  );
}

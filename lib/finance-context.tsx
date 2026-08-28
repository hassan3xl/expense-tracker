"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
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
} from "./mock-data";

interface FinanceContextType {
  accounts: AccountItem[];
  categories: CategoryItem[];
  transactions: TransactionItem[];
  budgets: BudgetItem[];
  goals: GoalItem[];
  isInitialized: boolean;

  // Modals state
  isAddTransactionOpen: boolean;
  setIsAddTransactionOpen: (open: boolean) => void;
  isAddAccountOpen: boolean;
  setIsAddAccountOpen: (open: boolean) => void;
  isAddBudgetOpen: boolean;
  setIsAddBudgetOpen: (open: boolean) => void;
  isAddGoalOpen: boolean;
  setIsAddGoalOpen: (open: boolean) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Action handlers
  handleAddTransaction: (newTx: Omit<TransactionItem, "id">) => void;
  handleDeleteTransaction: (id: string) => void;
  handleAddCategory: (newCat: Omit<CategoryItem, "id">) => void;
  handleEditCategory: (id: string, updated: Partial<CategoryItem>) => void;
  handleDeleteCategory: (id: string) => void;
  handleAddAccount: (newAcc: Omit<AccountItem, "id">) => void;
  handleAddBudget: (newB: Omit<BudgetItem, "id">) => void;
  handleAddGoal: (newG: Omit<GoalItem, "id">) => void;
  handleUpdateGoalDeposit: (goalId: string, amount: number) => void;
}

const DEFAULT_FINANCE_CONTEXT: FinanceContextType = {
  accounts: INITIAL_ACCOUNTS,
  categories: INITIAL_CATEGORIES,
  transactions: INITIAL_TRANSACTIONS,
  budgets: INITIAL_BUDGETS,
  goals: INITIAL_GOALS,
  isInitialized: true,
  isAddTransactionOpen: false,
  setIsAddTransactionOpen: () => {},
  isAddAccountOpen: false,
  setIsAddAccountOpen: () => {},
  isAddBudgetOpen: false,
  setIsAddBudgetOpen: () => {},
  isAddGoalOpen: false,
  setIsAddGoalOpen: () => {},
  isMobileSidebarOpen: false,
  setIsMobileSidebarOpen: () => {},
  handleAddTransaction: () => {},
  handleDeleteTransaction: () => {},
  handleAddCategory: () => {},
  handleEditCategory: () => {},
  handleDeleteCategory: () => {},
  handleAddAccount: () => {},
  handleAddBudget: () => {},
  handleAddGoal: () => {},
  handleUpdateGoalDeposit: () => {},
};

const FinanceContext = createContext<FinanceContextType>(DEFAULT_FINANCE_CONTEXT);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const userId = user?.id || "guest_user";

  const [accounts, setAccounts] = useState<AccountItem[]>(INITIAL_ACCOUNTS);
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [transactions, setTransactions] = useState<TransactionItem[]>(INITIAL_TRANSACTIONS);
  const [budgets, setBudgets] = useState<BudgetItem[]>(INITIAL_BUDGETS);
  const [goals, setGoals] = useState<GoalItem[]>(INITIAL_GOALS);
  const [isInitialized, setIsInitialized] = useState(false);

  // Modal open states
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Fetch cloud database data on mount or when user changes
  const fetchDbData = async () => {
    try {
      const res = await fetch("/api/sync");
      if (res.ok) {
        const data = await res.json();
        if (data.accounts) setAccounts(data.accounts);
        if (data.categories) setCategories(data.categories);
        if (data.transactions) setTransactions(data.transactions);
        if (data.budgets) setBudgets(data.budgets);
        if (data.goals) setGoals(data.goals);
      }
    } catch (e) {
      console.error("Failed to fetch cloud database sync:", e);
    } finally {
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDbData();
    } else {
      setIsInitialized(true);
    }
  }, [user?.id]);

  // Actions with DB persistence
  const handleAddTransaction = async (newTx: Omit<TransactionItem, "id">) => {
    const txId = `tx-${Date.now()}`;
    const tx: TransactionItem = { id: txId, ...newTx };
    setTransactions((prev) => [tx, ...prev]);

    setAccounts((prev) =>
      prev.map((acc) => {
        if (newTx.type === "TRANSFER") {
          if (acc.id === newTx.accountId) {
            return { ...acc, balance: acc.balance - newTx.amount };
          }
          if (newTx.toAccountId && acc.id === newTx.toAccountId) {
            return { ...acc, balance: acc.balance + newTx.amount };
          }
          return acc;
        }

        if (acc.id === newTx.accountId) {
          const delta = newTx.type === "INCOME" ? newTx.amount : -newTx.amount;
          return { ...acc, balance: acc.balance + delta };
        }
        return acc;
      })
    );

    if (newTx.type === "EXPENSE" && newTx.categoryId) {
      setBudgets((prev) =>
        prev.map((b) => {
          if (b.categoryId === newTx.categoryId) {
            return { ...b, spent: b.spent + newTx.amount };
          }
          return b;
        })
      );
    }

    try {
      await fetch("/api/sync/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ADD_TRANSACTION", payload: newTx }),
      });
      fetchDbData();
    } catch (err) {
      console.error("Sync action failed:", err);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    setTransactions((prev) => prev.filter((t) => t.id !== id));

    setAccounts((prev) =>
      prev.map((acc) => {
        if (tx.type === "TRANSFER") {
          if (acc.id === tx.accountId) {
            return { ...acc, balance: acc.balance + tx.amount };
          }
          if (tx.toAccountId && acc.id === tx.toAccountId) {
            return { ...acc, balance: acc.balance - tx.amount };
          }
          return acc;
        }

        if (acc.id === tx.accountId) {
          const delta = tx.type === "INCOME" ? -tx.amount : tx.amount;
          return { ...acc, balance: acc.balance + delta };
        }
        return acc;
      })
    );

    try {
      await fetch("/api/sync/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_TRANSACTION", payload: { id } }),
      });
      fetchDbData();
    } catch (err) {
      console.error("Sync action failed:", err);
    }
  };

  const handleAddCategory = async (newCat: Omit<CategoryItem, "id">) => {
    const cat: CategoryItem = { id: `cat-${Date.now()}`, ...newCat };
    setCategories((prev) => [...prev, cat]);

    try {
      await fetch("/api/sync/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ADD_CATEGORY", payload: newCat }),
      });
      fetchDbData();
    } catch (err) {
      console.error("Sync action failed:", err);
    }
  };

  const handleEditCategory = async (id: string, updated: Partial<CategoryItem>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );

    try {
      await fetch("/api/sync/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "EDIT_CATEGORY", payload: { id, ...updated } }),
      });
      fetchDbData();
    } catch (err) {
      console.error("Sync action failed:", err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));

    try {
      await fetch("/api/sync/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_CATEGORY", payload: { id } }),
      });
      fetchDbData();
    } catch (err) {
      console.error("Sync action failed:", err);
    }
  };

  const handleAddAccount = async (newAcc: Omit<AccountItem, "id">) => {
    const acc: AccountItem = { id: `acc-${Date.now()}`, ...newAcc };
    setAccounts((prev) => [...prev, acc]);

    try {
      await fetch("/api/sync/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ADD_ACCOUNT", payload: newAcc }),
      });
      fetchDbData();
    } catch (err) {
      console.error("Sync action failed:", err);
    }
  };

  const handleAddBudget = async (newB: Omit<BudgetItem, "id">) => {
    const b: BudgetItem = { id: `b-${Date.now()}`, ...newB };
    setBudgets((prev) => [...prev, b]);

    try {
      await fetch("/api/sync/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ADD_BUDGET", payload: newB }),
      });
      fetchDbData();
    } catch (err) {
      console.error("Sync action failed:", err);
    }
  };

  const handleAddGoal = async (newG: Omit<GoalItem, "id">) => {
    const g: GoalItem = { id: `g-${Date.now()}`, ...newG };
    setGoals((prev) => [...prev, g]);

    try {
      await fetch("/api/sync/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ADD_GOAL", payload: newG }),
      });
      fetchDbData();
    } catch (err) {
      console.error("Sync action failed:", err);
    }
  };

  const handleUpdateGoalDeposit = async (goalId: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          return { ...g, currentAmount: g.currentAmount + amount };
        }
        return g;
      })
    );

    try {
      await fetch("/api/sync/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_GOAL_DEPOSIT", payload: { goalId, amount } }),
      });
      fetchDbData();
    } catch (err) {
      console.error("Sync action failed:", err);
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        accounts: accounts || [],
        categories: categories || [],
        transactions: transactions || [],
        budgets: budgets || [],
        goals: goals || [],
        isInitialized,
        isAddTransactionOpen,
        setIsAddTransactionOpen,
        isAddAccountOpen,
        setIsAddAccountOpen,
        isAddBudgetOpen,
        setIsAddBudgetOpen,
        isAddGoalOpen,
        setIsAddGoalOpen,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        handleAddTransaction,
        handleDeleteTransaction,
        handleAddCategory,
        handleEditCategory,
        handleDeleteCategory,
        handleAddAccount,
        handleAddBudget,
        handleAddGoal,
        handleUpdateGoalDeposit,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  return context || DEFAULT_FINANCE_CONTEXT;
}

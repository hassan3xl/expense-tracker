"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  AccountItem,
  CategoryItem,
  TransactionItem,
  BudgetItem,
  GoalItem,
} from "./mock-data";
import { Database, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

interface FinanceContextType {
  accounts: AccountItem[];
  categories: CategoryItem[];
  transactions: TransactionItem[];
  budgets: BudgetItem[];
  goals: GoalItem[];
  isInitialized: boolean;
  dbError: string | null;

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
  handleAddTransaction: (newTx: Omit<TransactionItem, "id">) => Promise<void>;
  handleDeleteTransaction: (id: string) => Promise<void>;
  handleAddCategory: (newCat: Omit<CategoryItem, "id">) => Promise<void>;
  handleEditCategory: (id: string, updated: Partial<CategoryItem>) => Promise<void>;
  handleDeleteCategory: (id: string) => Promise<void>;
  handleAddAccount: (newAcc: Omit<AccountItem, "id">) => Promise<void>;
  handleEditAccount: (id: string, updated: Partial<AccountItem>) => Promise<void>;
  handleDeleteAccount: (id: string) => Promise<void>;
  handleAddBudget: (newB: Omit<BudgetItem, "id">) => Promise<void>;
  handleAddGoal: (newG: Omit<GoalItem, "id">) => Promise<void>;
  handleUpdateGoalDeposit: (goalId: string, amount: number) => Promise<void>;
  handleTogglePendingTransaction: (id: string) => Promise<void>;
  handlePartialCollectTransaction: (
    id: string,
    amountCollected: number,
    accountId: string
  ) => Promise<void>;
}

const DEFAULT_FINANCE_CONTEXT: FinanceContextType = {
  accounts: [],
  categories: [],
  transactions: [],
  budgets: [],
  goals: [],
  isInitialized: false,
  dbError: null,
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
  handleAddTransaction: async () => {},
  handleDeleteTransaction: async () => {},
  handleAddCategory: async () => {},
  handleEditCategory: async () => {},
  handleDeleteCategory: async () => {},
  handleAddAccount: async () => {},
  handleEditAccount: async () => {},
  handleDeleteAccount: async () => {},
  handleAddBudget: async () => {},
  handleAddGoal: async () => {},
  handleUpdateGoalDeposit: async () => {},
  handleTogglePendingTransaction: async () => {},
  handlePartialCollectTransaction: async () => {},
};

const FinanceContext = createContext<FinanceContextType>(DEFAULT_FINANCE_CONTEXT);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();

  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Modal open states
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Fetch PostgreSQL database data directly
  const fetchDbData = async () => {
    try {
      setDbError(null);
      const res = await fetch("/api/sync", { cache: "no-store" });
      
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const msg = errJson.error || `PostgreSQL database request failed with status ${res.status}`;
        setDbError(msg);
        throw new Error(msg);
      }

      const data = await res.json();
      setAccounts(data.accounts || []);
      setCategories(data.categories || []);
      setTransactions(data.transactions || []);
      setBudgets(data.budgets || []);
      setGoals(data.goals || []);
      setDbError(null);
    } catch (e: any) {
      console.error("Database connection failure:", e);
      setDbError(e.message || "Failed to connect to PostgreSQL database");
    } finally {
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        fetchDbData();
      } else {
        setIsInitialized(true);
      }
    }
  }, [isLoaded, user?.id]);

  // Action helpers that talk directly to PostgreSQL database
  const executeDbAction = async (action: string, payload: any): Promise<boolean> => {
    try {
      const res = await fetch("/api/sync/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errorMsg = errJson.error || `PostgreSQL database action ${action} failed`;
        console.error(`DB Action Error [${action}]:`, errorMsg);
        toast.error(errorMsg);
        if (res.status === 503) {
          setDbError(errorMsg);
        }
        return false;
      }

      // Refresh state from DB to reflect exact database state
      await fetchDbData();
      return true;
    } catch (err: any) {
      console.error(`Failed to execute DB action [${action}]:`, err);
      toast.error(err.message || "An unexpected error occurred");
      return false;
    }
  };

  const handleAddTransaction = async (newTx: Omit<TransactionItem, "id">) => {
    const success = await executeDbAction("ADD_TRANSACTION", newTx);
    if (success) {
      toast.success(
        newTx.type === "INCOME"
          ? "Income transaction recorded!"
          : newTx.type === "EXPENSE"
          ? "Expense transaction recorded!"
          : "Transfer transaction recorded!"
      );
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    const success = await executeDbAction("DELETE_TRANSACTION", { id });
    if (success) {
      toast.success("Transaction deleted successfully");
    }
  };

  const handleAddCategory = async (newCat: Omit<CategoryItem, "id">) => {
    const success = await executeDbAction("ADD_CATEGORY", newCat);
    if (success) {
      toast.success(`Category "${newCat.name}" created!`);
    }
  };

  const handleEditCategory = async (id: string, updated: Partial<CategoryItem>) => {
    const success = await executeDbAction("EDIT_CATEGORY", { id, ...updated });
    if (success) {
      toast.success("Category updated successfully");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const success = await executeDbAction("DELETE_CATEGORY", { id });
    if (success) {
      toast.success("Category deleted");
    }
  };

  const handleAddAccount = async (newAcc: Omit<AccountItem, "id">) => {
    const success = await executeDbAction("ADD_ACCOUNT", newAcc);
    if (success) {
      toast.success(`Account "${newAcc.name}" created!`);
    }
  };

  const handleEditAccount = async (id: string, updated: Partial<AccountItem>) => {
    const success = await executeDbAction("EDIT_ACCOUNT", { id, ...updated });
    if (success) {
      toast.success("Account details updated");
    }
  };

  const handleDeleteAccount = async (id: string) => {
    const success = await executeDbAction("DELETE_ACCOUNT", { id });
    if (success) {
      toast.success("Account deleted");
    }
  };

  const handleAddBudget = async (newB: Omit<BudgetItem, "id">) => {
    const success = await executeDbAction("ADD_BUDGET", newB);
    if (success) {
      toast.success("Budget target saved!");
    }
  };

  const handleAddGoal = async (newG: Omit<GoalItem, "id">) => {
    const success = await executeDbAction("ADD_GOAL", newG);
    if (success) {
      toast.success(`Savings goal "${newG.name}" created!`);
    }
  };

  const handleUpdateGoalDeposit = async (goalId: string, amount: number) => {
    const success = await executeDbAction("UPDATE_GOAL_DEPOSIT", { goalId, amount });
    if (success) {
      toast.success(`Added deposit of $${amount} to savings goal!`);
    }
  };

  const handleTogglePendingTransaction = async (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    const success = await executeDbAction("TOGGLE_PENDING_TRANSACTION", { id });
    if (success) {
      toast.success(
        tx?.isPending
          ? "Transaction marked as Paid!"
          : "Transaction reverted to Pending"
      );
    }
  };

  const handlePartialCollectTransaction = async (
    id: string,
    amountCollected: number,
    accountId: string
  ) => {
    const success = await executeDbAction("PARTIAL_COLLECT_TRANSACTION", {
      id,
      amountCollected,
      accountId,
    });
    if (success) {
      toast.success(`Collected payment of $${amountCollected}!`);
    }
  };

  // If database fails, render Database Error screen
  if (dbError) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full glass-card p-8 rounded-2xl border border-rose-500/30 text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/30">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">PostgreSQL Connection Error</h2>
          <p className="text-sm text-rose-300 bg-rose-950/50 p-3 rounded-xl border border-rose-900/50 font-mono text-left overflow-auto">
            {dbError}
          </p>
          <p className="text-xs text-slate-400">
            Browser local storage fallback has been removed. The application requires an active PostgreSQL database connection to operate.
          </p>
          <Button
            onClick={fetchDbData}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Retry PostgreSQL Connection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <FinanceContext.Provider
      value={{
        accounts: accounts || [],
        categories: categories || [],
        transactions: transactions || [],
        budgets: budgets || [],
        goals: goals || [],
        isInitialized,
        dbError,
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
        handleEditAccount,
        handleDeleteAccount,
        handleAddBudget,
        handleAddGoal,
        handleUpdateGoalDeposit,
        handleTogglePendingTransaction,
        handlePartialCollectTransaction,
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

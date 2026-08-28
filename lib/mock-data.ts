export interface AccountItem {
  id: string;
  name: string;
  type: "CHECKING" | "SAVINGS" | "CREDIT_CARD" | "INVESTMENT" | "CASH";
  balance: number;
  currency: string;
  accountNumber?: string;
  color: string;
  isDefault?: boolean;
}

export interface CategoryItem {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  icon: string;
  color: string;
}

export interface TransactionItem {
  id: string;
  accountId: string;
  accountName?: string;
  toAccountId?: string;
  toAccountName?: string;
  categoryId?: string;
  categoryName?: string;
  categoryIcon?: string;
  amount: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  description: string;
  date: string;
  payee?: string;
  isRecurring?: boolean;
}

export interface BudgetItem {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  amount: number;
  spent: number;
  period: "MONTHLY" | "YEARLY";
}

export interface GoalItem {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  color: string;
  icon: string;
}

export const INITIAL_ACCOUNTS: AccountItem[] = [];

export const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: "cat-1", name: "Salary", type: "INCOME", icon: "briefcase", color: "#10b981" },
  { id: "cat-2", name: "Freelance", type: "INCOME", icon: "laptop", color: "#14b8a6" },
  { id: "cat-3", name: "Investments", type: "INCOME", icon: "trending-up", color: "#6366f1" },
  { id: "cat-4", name: "Housing & Rent", type: "EXPENSE", icon: "home", color: "#f59e0b" },
  { id: "cat-5", name: "Groceries & Dining", type: "EXPENSE", icon: "utensils", color: "#ec4899" },
  { id: "cat-6", name: "Shopping", type: "EXPENSE", icon: "shopping-bag", color: "#8b5cf6" },
  { id: "cat-7", name: "Utilities & Bills", type: "EXPENSE", icon: "zap", color: "#3b82f6" },
  { id: "cat-8", name: "Entertainment", type: "EXPENSE", icon: "film", color: "#06b6d4" },
  { id: "cat-9", name: "Transportation", type: "EXPENSE", icon: "car", color: "#64748b" },
];

export const INITIAL_TRANSACTIONS: TransactionItem[] = [];

export const INITIAL_BUDGETS: BudgetItem[] = [];

export const INITIAL_GOALS: GoalItem[] = [];


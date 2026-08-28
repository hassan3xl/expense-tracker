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
  isPending?: boolean;
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
export const INITIAL_CATEGORIES: CategoryItem[] = [];
export const INITIAL_TRANSACTIONS: TransactionItem[] = [];
export const INITIAL_BUDGETS: BudgetItem[] = [];
export const INITIAL_GOALS: GoalItem[] = [];


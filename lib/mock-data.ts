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

export const INITIAL_ACCOUNTS: AccountItem[] = [
  {
    id: "acc-1",
    name: "Main Checking",
    type: "CHECKING",
    balance: 5420.50,
    currency: "USD",
    accountNumber: "•••• 4892",
    color: "#10b981",
    isDefault: true,
  },
  {
    id: "acc-2",
    name: "High Yield Savings",
    type: "SAVINGS",
    balance: 14850.00,
    currency: "USD",
    accountNumber: "•••• 8104",
    color: "#3b82f6",
  },
  {
    id: "acc-3",
    name: "Platinum Credit Card",
    type: "CREDIT_CARD",
    balance: -840.25,
    currency: "USD",
    accountNumber: "•••• 3910",
    color: "#f43f5e",
  },
  {
    id: "acc-4",
    name: "Vanguard Index Portfolio",
    type: "INVESTMENT",
    balance: 38200.00,
    currency: "USD",
    accountNumber: "•••• 9021",
    color: "#8b5cf6",
  },
];

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

export const INITIAL_TRANSACTIONS: TransactionItem[] = [
  {
    id: "tx-1",
    accountId: "acc-1",
    accountName: "Main Checking",
    categoryId: "cat-1",
    categoryName: "Salary",
    categoryIcon: "briefcase",
    amount: 4250.00,
    type: "INCOME",
    description: "Monthly Salary Deposit",
    date: "2026-08-25",
    payee: "Acme Corp",
  },
  {
    id: "tx-2",
    accountId: "acc-1",
    accountName: "Main Checking",
    categoryId: "cat-4",
    categoryName: "Housing & Rent",
    categoryIcon: "home",
    amount: 1450.00,
    type: "EXPENSE",
    description: "Apartment Rent Payment",
    date: "2026-08-24",
    payee: "Skyline Properties",
    isRecurring: true,
  },
  {
    id: "tx-3",
    accountId: "acc-3",
    accountName: "Platinum Credit Card",
    categoryId: "cat-5",
    categoryName: "Groceries & Dining",
    categoryIcon: "utensils",
    amount: 142.80,
    type: "EXPENSE",
    description: "Whole Foods Market",
    date: "2026-08-23",
    payee: "Whole Foods",
  },
  {
    id: "tx-4",
    accountId: "acc-2",
    accountName: "High Yield Savings",
    categoryId: "cat-3",
    categoryName: "Investments",
    categoryIcon: "trending-up",
    amount: 125.40,
    type: "INCOME",
    description: "Quarterly Dividend Payout",
    date: "2026-08-22",
    payee: "Vanguard",
  },
  {
    id: "tx-5",
    accountId: "acc-3",
    accountName: "Platinum Credit Card",
    categoryId: "cat-7",
    categoryName: "Utilities & Bills",
    categoryIcon: "zap",
    amount: 88.50,
    type: "EXPENSE",
    description: "City Electric & Power",
    date: "2026-08-20",
    payee: "City Power",
    isRecurring: true,
  },
  {
    id: "tx-6",
    accountId: "acc-1",
    accountName: "Main Checking",
    categoryId: "cat-6",
    categoryName: "Shopping",
    categoryIcon: "shopping-bag",
    amount: 119.99,
    type: "EXPENSE",
    description: "New Running Shoes",
    date: "2026-08-18",
    payee: "Nike Store",
  },
  {
    id: "tx-7",
    accountId: "acc-1",
    accountName: "Main Checking",
    categoryId: "cat-8",
    categoryName: "Entertainment",
    categoryIcon: "film",
    amount: 15.99,
    type: "EXPENSE",
    description: "Netflix Subscription",
    date: "2026-08-15",
    payee: "Netflix",
    isRecurring: true,
  },
];

export const INITIAL_BUDGETS: BudgetItem[] = [
  {
    id: "b-1",
    categoryId: "cat-5",
    categoryName: "Groceries & Dining",
    categoryColor: "#ec4899",
    amount: 600.00,
    spent: 420.80,
    period: "MONTHLY",
  },
  {
    id: "b-2",
    categoryId: "cat-4",
    categoryName: "Housing & Rent",
    categoryColor: "#f59e0b",
    amount: 1500.00,
    spent: 1450.00,
    period: "MONTHLY",
  },
  {
    id: "b-3",
    categoryId: "cat-6",
    categoryName: "Shopping",
    categoryColor: "#8b5cf6",
    amount: 350.00,
    spent: 219.99,
    period: "MONTHLY",
  },
  {
    id: "b-4",
    categoryId: "cat-8",
    categoryName: "Entertainment",
    categoryColor: "#06b6d4",
    amount: 200.00,
    spent: 95.00,
    period: "MONTHLY",
  },
];

export const INITIAL_GOALS: GoalItem[] = [
  {
    id: "g-1",
    name: "Emergency Fund",
    targetAmount: 18000.00,
    currentAmount: 14850.00,
    targetDate: "2026-12-31",
    color: "#10b981",
    icon: "shield",
  },
  {
    id: "g-2",
    name: "Electric Vehicle Downpayment",
    targetAmount: 12000.00,
    currentAmount: 7500.00,
    targetDate: "2027-06-30",
    color: "#3b82f6",
    icon: "car",
  },
  {
    id: "g-3",
    name: "Tokyo Summer Vacation",
    targetAmount: 4500.00,
    currentAmount: 3200.00,
    targetDate: "2027-04-15",
    color: "#f59e0b",
    icon: "plane",
  },
];

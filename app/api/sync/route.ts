import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import {
  INITIAL_ACCOUNTS,
  INITIAL_CATEGORIES,
} from "@/lib/mock-data";

export async function GET() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const primaryEmail =
      clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId
      )?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress || "";

    let dbUser = await db.user.findUnique({
      where: { clerkUserId: clerkUser.id },
      include: {
        accounts: true,
        categories: true,
        transactions: {
          include: {
            account: true,
            toAccount: true,
            category: true,
          },
          orderBy: { date: "desc" },
        },
        budgets: {
          include: {
            category: true,
          },
        },
        goals: true,
      },
    });

    // If not found by clerkUserId, check if a user record exists with the same primary email
    if (!dbUser && primaryEmail) {
      const existingUserByEmail = await db.user.findUnique({
        where: { email: primaryEmail },
      });

      if (existingUserByEmail) {
        dbUser = await db.user.update({
          where: { id: existingUserByEmail.id },
          data: {
            clerkUserId: clerkUser.id,
            name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || existingUserByEmail.name,
            imageUrl: clerkUser.imageUrl || existingUserByEmail.imageUrl,
          },
          include: {
            accounts: true,
            categories: true,
            transactions: {
              include: {
                account: true,
                toAccount: true,
                category: true,
              },
              orderBy: { date: "desc" },
            },
            budgets: {
              include: {
                category: true,
              },
            },
            goals: true,
          },
        });
      }
    }

    // If user does not exist in DB yet, seed initial data for them
    if (!dbUser) {
      dbUser = await db.user.create({
        data: {
          clerkUserId: clerkUser.id,
          email: primaryEmail,
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "User",
          imageUrl: clerkUser.imageUrl,
          accounts: {
            create: [
              {
                name: "Main Checking",
                type: "CHECKING",
                balance: 0.0,
                currency: "NGN",
                accountNumber: "*4921",
                color: "#10b981",
                isDefault: true,
              },
              {
                name: "High-Yield Savings",
                type: "SAVINGS",
                balance: 0.0,
                currency: "NGN",
                accountNumber: "*8832",
                color: "#6366f1",
              },
            ],
          },
          categories: {
            create: [
              { name: "Salary", type: "INCOME", icon: "briefcase", color: "#10b981" },
              { name: "Freelance", type: "INCOME", icon: "laptop", color: "#14b8a6" },
              { name: "Groceries", type: "EXPENSE", icon: "shopping-cart", color: "#f59e0b" },
              { name: "Dining & Drinks", type: "EXPENSE", icon: "utensils", color: "#ef4444" },
              { name: "Utilities & Bills", type: "EXPENSE", icon: "zap", color: "#8b5cf6" },
              { name: "Transport", type: "EXPENSE", icon: "car", color: "#06b6d4" },
            ],
          },
        },
        include: {
          accounts: true,
          categories: true,
          transactions: {
            include: {
              account: true,
              toAccount: true,
              category: true,
            },
            orderBy: { date: "desc" },
          },
          budgets: {
            include: {
              category: true,
            },
          },
          goals: true,
        },
      });
    }

    // Format output
    const accounts = dbUser.accounts.map((acc) => ({
      id: acc.id,
      name: acc.name,
      type: acc.type as any,
      balance: acc.balance,
      currency: acc.currency,
      accountNumber: acc.accountNumber || undefined,
      color: acc.color || "#3b82f6",
      isDefault: acc.isDefault,
    }));

    const categories = dbUser.categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      type: cat.type as any,
      icon: cat.icon,
      color: cat.color,
    }));

    const transactions = dbUser.transactions.map((tx) => ({
      id: tx.id,
      accountId: tx.accountId,
      accountName: tx.account?.name || "Account",
      toAccountId: tx.toAccountId || undefined,
      toAccountName: tx.toAccount?.name || undefined,
      categoryId: tx.categoryId || undefined,
      categoryName: tx.type === "TRANSFER" ? "Transfer" : tx.category?.name || "Uncategorized",
      categoryIcon: tx.type === "TRANSFER" ? "refresh-cw" : tx.category?.icon || "tag",
      amount: tx.amount,
      type: tx.type as any,
      description: tx.description,
      date: tx.date.toISOString().split("T")[0],
      payee: tx.payee || undefined,
      isPending: tx.isPending,
    }));

    const budgets = dbUser.budgets.map((b) => ({
      id: b.id,
      categoryId: b.categoryId,
      categoryName: b.category?.name || "Category",
      categoryColor: b.category?.color || "#3b82f6",
      amount: b.amount,
      spent: dbUser.transactions
        .filter((t) => t.categoryId === b.categoryId && t.type === "EXPENSE")
        .reduce((sum, t) => sum + t.amount, 0),
      period: b.period as any,
    }));

    const goals = dbUser.goals.map((g) => ({
      id: g.id,
      name: g.name,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      targetDate: g.targetDate.toISOString().split("T")[0],
      color: g.color || "#10b981",
      icon: g.icon || "target",
    }));

    return NextResponse.json({
      accounts,
      categories,
      transactions,
      budgets,
      goals,
    });
  } catch (error) {
    console.error("GET /api/sync error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user database data" },
      { status: 500 }
    );
  }
}

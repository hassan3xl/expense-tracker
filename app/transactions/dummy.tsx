import React, { Suspense } from "react";
import { getSessionUser, getCurrentProject } from "@/lib/auth";
import { sql } from "@/lib/db";
import Navbar from "@/components/layout/Navbar";
import Header from "@/components/Header";
import TransactionFilters from "@/components/transactions/TransactionFilters";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ArrowUpRight,
  ArrowDownRight,
  Tag,
  Calendar,
  ReceiptText,
} from "lucide-react";
import { Toaster } from "sonner";
import { formatNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface TransactionsPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    category?: string;
  }>;
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const user = await getSessionUser();
  if (!user) return null;

  // Resolve search parameters (Next.js 15+ searchParams is a Promise)
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";
  const type = resolvedParams.type || "";
  const category = resolvedParams.category || "";

  // Get active project and list of all projects
  const currentProj = await getCurrentProject(user.userId);
  const projectsData = await sql`
    SELECT DISTINCT p.id, p.name FROM projects p
    LEFT JOIN project_members pm ON pm.project_id = p.id
    WHERE p.user_id = ${user.userId} OR pm.user_id = ${user.userId}
    ORDER BY p.name ASC
  `;
  const projects = (projectsData || []).map((p) => ({
    id: Number(p.id),
    name: String(p.name),
  }));

  const ilikePattern = `%${q}%`;
  const transactionsData = await sql`
    SELECT id, type, category, amount, description, date 
    FROM transactions 
    WHERE project_id = ${currentProj.id}
      AND (${q} = '' OR description ILIKE ${ilikePattern} OR category ILIKE ${ilikePattern})
      AND (${type} = '' OR type = ${type})
      AND (${category} = '' OR category = ${category})
    ORDER BY date DESC
  `;

  // Format the data properly
  const transactions = (transactionsData || []).map((tx) => ({
    id: Number(tx.id),
    type: String(tx.type),
    category: String(tx.category),
    amount: String(tx.amount),
    description: String(tx.description || ""),
    date: String(tx.date),
  }));

  // Calculations for filtered data
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((tx) => {
    const val = parseFloat(tx.amount);
    if (tx.type === "income") totalIncome += val;
    else if (tx.type === "expense") totalExpense += val;
  });

  // Generate 50 dummy transaction items to populate a long scrollable list
  const dummyTransactions = Array.from({ length: 50 }, (_, i) => ({
    id: 9999 + i,
    type: i % 2 === 0 ? "income" : "expense",
    category: i % 3 === 0 ? "Salary" : i % 3 === 1 ? "Food" : "Entertainment",
    amount: (1500 + i * 120).toString(),
    description: `Dummy transaction record number ${i + 1}`,
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
  }));

  return (
    <main>
      <Header
        title="Transactions History"
        subtitle="Scrolling test page with 50 dummy transactions to diagnose mobile render issues."
        showRefresh={false}
        actions={
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-card border border-border text-xs font-semibold text-muted-foreground">
            <ReceiptText className="size-4 text-primary" />
            <span>Test Records: {dummyTransactions.length}</span>
          </div>
        }
      />

      <div className="mb-6">
        <TransactionFilters />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Scroll Test List</h2>
        <RecentTransactions transactions={dummyTransactions} readOnly={true} />
      </div>
    </main>
  );
}

import React, { Suspense } from 'react';
import { getSessionUser, getCurrentProject } from '@/lib/auth';
import { sql } from '@/lib/db';
import Navbar from '@/components/layout/Navbar';
import TransactionFilters from '@/components/transactions/TransactionFilters';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Tag, Calendar, ReceiptText } from 'lucide-react';
import { Toaster } from 'sonner';
import { formatNaira } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface TransactionsPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    category?: string;
  }>;
}

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const user = await getSessionUser();
  if (!user) return null;

  // Resolve search parameters (Next.js 15+ searchParams is a Promise)
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || '';
  const type = resolvedParams.type || '';
  const category = resolvedParams.category || '';

  // Get active project and list of all projects
  const currentProj = await getCurrentProject(user.userId);
  const projectsData = await sql`
    SELECT id, name FROM projects WHERE user_id = ${user.userId} ORDER BY name ASC
  `;
  const projects = (projectsData || []).map(p => ({
    id: Number(p.id),
    name: String(p.name),
  }));

  const ilikePattern = `%${q}%`;
  const transactionsData = await sql`
    SELECT id, type, category, amount, description, date 
    FROM transactions 
    WHERE user_id = ${user.userId} 
      AND project_id = ${currentProj.id}
      AND (${q} = '' OR description ILIKE ${ilikePattern} OR category ILIKE ${ilikePattern})
      AND (${type} = '' OR type = ${type})
      AND (${category} = '' OR category = ${category})
    ORDER BY date DESC
  `;

  // Format the data properly
  const transactions = (transactionsData || []).map(tx => ({
    id: Number(tx.id),
    type: String(tx.type),
    category: String(tx.category),
    amount: String(tx.amount),
    description: String(tx.description || ''),
    date: String(tx.date),
  }));

  // Calculations for filtered data
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((tx) => {
    const val = parseFloat(tx.amount);
    if (tx.type === 'income') totalIncome += val;
    else if (tx.type === 'expense') totalExpense += val;
  });

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans">
      <Navbar 
        username={user.username} 
        initialProjects={projects} 
        currentProject={currentProj} 
      />
      
      <Toaster position="top-right" theme="dark" toastOptions={{
        style: { background: '#0f172a', border: '1px solid #1e293b', color: '#f8fafc' }
      }} />

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 space-y-6 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-50 via-slate-100 to-indigo-200">
              Transactions History
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Search and filter your entire transaction logs below.
            </p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-zinc-900/60 border border-slate-800/80 text-xs font-semibold text-slate-300">
            <ReceiptText className="size-4 text-indigo-400" />
            <span>Total Record count: {transactions.length}</span>
          </div>
        </div>

        <div className="animate-in fade-in duration-500 delay-100">
          <Suspense fallback={<div className="h-10 bg-slate-900/30 border border-slate-800 rounded-xl animate-pulse" />}>
            <TransactionFilters />
          </Suspense>
        </div>

        {/* Aggregate Info for current filter */}
        {(type || category || q) && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-3xl border border-slate-800 bg-slate-900/10 text-sm font-semibold animate-in fade-in duration-300">
            <div className="text-slate-400">
              Filtered Earnings:{' '}
              <span className="text-emerald-400 font-bold block sm:inline mt-0.5 sm:mt-0">
                {formatNaira(totalIncome)}
              </span>
            </div>
            <div className="text-slate-400">
              Filtered Expenses:{' '}
              <span className="text-rose-400 font-bold block sm:inline mt-0.5 sm:mt-0">
                {formatNaira(totalExpense)}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1 text-slate-400 border-t sm:border-t-0 sm:border-l border-slate-850 pt-2 sm:pt-0 sm:pl-4">
              Net Result:{' '}
              <span className={`font-bold block sm:inline mt-0.5 sm:mt-0 ${totalIncome - totalExpense >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatNaira(totalIncome - totalExpense)}
              </span>
            </div>
          </div>
        )}

        {/* Transactions Table/List Card */}
        <Card className="border border-slate-800/80 bg-slate-900/20 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-xl shadow-black/5 animate-in fade-in duration-500 delay-200">
          <CardHeader className="px-0 pt-0 pb-4">
            <CardTitle className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <ReceiptText className="size-5 text-indigo-400" />
              Transactions Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <RecentTransactions transactions={transactions} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

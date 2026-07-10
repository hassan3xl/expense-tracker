'use client';

import React, { useTransition } from 'react';
import { deleteTransactionAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Trash2, ArrowUpRight, ArrowDownRight, Tag, Calendar, ReceiptText } from 'lucide-react';
import { toast } from 'sonner';
import { formatNaira } from '@/lib/utils';

interface Transaction {
  id: number;
  type: string;
  category: string;
  amount: string;
  description: string;
  date: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: number) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    startTransition(async () => {
      try {
        await deleteTransactionAction(id);
        toast.success('Transaction deleted successfully!');
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete transaction');
      }
    });
  };

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/10">
        <ReceiptText className="size-8 text-slate-600 mb-2" />
        <p className="text-slate-400 text-sm font-medium">No transactions recorded yet.</p>
        <p className="text-slate-500 text-xs mt-1">Use the quick add form to record your first income or expense.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.slice(0, 5).map((tx) => {
        const isIncome = tx.type === 'income';
        const amount = parseFloat(tx.amount);
        const formattedDate = new Date(tx.date).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

        return (
          <div
            key={tx.id}
            className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-800/60 bg-slate-900/30 hover:bg-slate-900/50 hover:border-slate-800 transition-all duration-300 group"
          >
            {/* Left: Icon and Details */}
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center size-10 rounded-xl ${
                  isIncome
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {isIncome ? <ArrowUpRight className="size-5" /> : <ArrowDownRight className="size-5" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-200 truncate max-w-[150px] sm:max-w-[200px]">
                  {tx.description || tx.category}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-black/40 px-1.5 py-0.5 rounded-md border border-slate-900">
                    <Tag className="size-3 text-slate-500" />
                    {tx.category}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Calendar className="size-3" />
                    {formattedDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Amount and Delete */}
            <div className="flex items-center gap-3">
              <span
                className={`text-sm font-bold tracking-tight ${
                  isIncome ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isIncome ? '+' : '-'}{formatNaira(amount)}
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => handleDelete(tx.id)}
                disabled={isPending}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-300"
                title="Delete Transaction"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}


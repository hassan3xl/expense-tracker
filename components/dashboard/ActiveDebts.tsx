'use client';

import React, { useState, useTransition } from 'react';
import { addDebtPaymentAction, deleteDebtAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Landmark, Trash2, CheckCircle2, User, Calendar, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { formatNaira } from '@/lib/utils';

interface Debt {
  id: number;
  person: string;
  type: string;
  amount: string;
  remaining_amount: string;
  description: string;
  due_date: string | null;
  status: string;
  created_at: string;
}

interface ActiveDebtsProps {
  debts: Debt[];
}

export default function ActiveDebts({ debts }: ActiveDebtsProps) {
  const [activePaymentId, setActivePaymentId] = useState<number | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [isPending, startTransition] = useTransition();

  const handlePay = (debtId: number) => {
    setActivePaymentId(debtId === activePaymentId ? null : debtId);
    setPaymentAmount('');
    setPaymentNote('');
  };

  const handleRecordPayment = (debtId: number, remainingAmount: number) => {
    const parsedAmount = parseFloat(paymentAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid positive payment amount.');
      return;
    }
    if (parsedAmount > remainingAmount) {
      toast.error(`Payment cannot exceed the remaining balance of ${formatNaira(remainingAmount)}.`);
      return;
    }

    startTransition(async () => {
      try {
        await addDebtPaymentAction({
          debtId,
          paymentAmount: parsedAmount,
          description: paymentNote.trim() || undefined,
        });
        toast.success('Payment recorded and transaction logged successfully!');
        setActivePaymentId(null);
        setPaymentAmount('');
        setPaymentNote('');
      } catch (err: any) {
        toast.error(err.message || 'Failed to record payment');
      }
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm('Are you sure you want to delete this debt record? This does not delete associated transaction logs.')) return;

    startTransition(async () => {
      try {
        await deleteDebtAction(id);
        toast.success('Debt record deleted successfully!');
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete debt record');
      }
    });
  };

  if (debts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/10">
        <Landmark className="size-8 text-slate-600 mb-2" />
        <p className="text-slate-400 text-sm font-medium">No debts or loans found.</p>
        <p className="text-slate-500 text-xs mt-1">Lend or borrow money to record details.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {debts.map((debt) => {
        const total = parseFloat(debt.amount);
        const remaining = parseFloat(debt.remaining_amount);
        const paid = total - remaining;
        const progressPercent = Math.min(100, Math.max(0, (paid / total) * 100));
        const isOwedToMe = debt.type === 'owed_to_me'; // Owed to me = I lent it
        const isPaid = debt.status === 'paid';

        const formattedDueDate = debt.due_date
          ? new Date(debt.due_date).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : null;

        const isOverdue = !isPaid && debt.due_date && new Date(debt.due_date) < new Date();

        return (
          <div
            key={debt.id}
            className={`p-4 rounded-2xl border transition-all duration-300 group ${
              isPaid 
                ? 'border-slate-900/80 bg-black/20 opacity-75' 
                : 'border-slate-800 bg-slate-900/30 hover:border-slate-800/80'
            }`}
          >
            {/* Header: Person & Type Badge */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center size-8 rounded-lg bg-black/60 border border-slate-800">
                  <User className="size-4 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{debt.person}</h4>
                  {debt.description && (
                    <p className="text-xs text-slate-500 line-clamp-1">{debt.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isOwedToMe
                      ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {isOwedToMe ? 'Lent' : 'Borrowed'}
                </span>

                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleDelete(debt.id)}
                  disabled={isPending}
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-300"
                  title="Delete Record"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>

            {/* Repayment Progress */}
            <div className="space-y-1.5 my-3">
              <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                <span>Repaid: {formatNaira(paid)}</span>
                <span className="text-slate-300">Remaining: {formatNaira(remaining)} / {formatNaira(total)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black border border-slate-900 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isPaid
                      ? 'bg-emerald-500'
                      : isOwedToMe
                      ? 'bg-violet-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Due Date & Pay Button */}
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800/40">
              {formattedDueDate ? (
                <span
                  className={`flex items-center gap-1 text-[11px] font-medium ${
                    isOverdue ? 'text-rose-400 font-semibold animate-pulse' : 'text-slate-500'
                  }`}
                >
                  <Calendar className="size-3.5" />
                  Due {formattedDueDate} {isOverdue && '(Overdue)'}
                </span>
              ) : (
                <span className="text-[11px] text-slate-600">No due date</span>
              )}

              {isPaid ? (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 px-1 py-0.5 rounded-md bg-emerald-500/5 border border-emerald-500/15">
                  <CheckCircle2 className="size-3.5" /> Paid & Settled
                </span>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handlePay(debt.id)}
                  className={`rounded-xl border h-7 px-2.5 text-xs font-semibold ${
                    activePaymentId === debt.id
                      ? 'border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                      : isOwedToMe
                      ? 'border-violet-500/30 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20'
                      : 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                  }`}
                >
                  {activePaymentId === debt.id ? (
                    <>
                      <X className="size-3.5 mr-1" /> Cancel
                    </>
                  ) : (
                    <>
                      <Plus className="size-3.5 mr-1" /> Log Repayment
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Inline Payment Form */}
            {activePaymentId === debt.id && !isPaid && (
              <div className="mt-3 p-3 rounded-xl bg-black/70 border border-slate-800/80 space-y-3.5 animate-in slide-in-from-top-2 duration-200">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-sm font-bold text-slate-500 select-none">
                      ₦
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="pl-7 bg-slate-900 border-slate-800 h-8 rounded-lg text-xs"
                    />
                  </div>
                  <Input
                    type="text"
                    placeholder="Note (e.g. Bank transfer)"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    className="bg-slate-900 border-slate-800 h-8 rounded-lg text-xs flex-[1.5]"
                  />
                  <Button
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleRecordPayment(debt.id, remaining)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg h-8 px-3 text-xs shrink-0 font-semibold"
                  >
                    Submit
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

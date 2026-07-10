'use client';

import React, { useState, useTransition } from 'react';
import { addDebtAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Landmark, User, FileText, Calendar, Handshake } from 'lucide-react';
import { toast } from 'sonner';

export default function DebtForm() {
  const [type, setType] = useState<'owed_to_me' | 'owed_by_me'>('owed_by_me');
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!person.trim()) {
      toast.error('Please enter the name of the person.');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid positive amount.');
      return;
    }

    startTransition(async () => {
      try {
        await addDebtAction({
          person: person.trim(),
          type,
          amount: parseFloat(amount),
          description: description.trim(),
          due_date: dueDate || undefined,
        });
        toast.success(`Debt record with ${person} added successfully!`);
        setPerson('');
        setAmount('');
        setDescription('');
        setDueDate('');
      } catch (err: any) {
        toast.error(err.message || 'Failed to save debt record');
      }
    });
  };

  return (
    <Card className="border border-slate-800/80 bg-slate-900/40 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl shadow-black/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <Handshake className="size-5 text-indigo-400" />
          Quick Add Debt / Loan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-black/60 border border-slate-800/50">
            <button
              type="button"
              onClick={() => setType('owed_by_me')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                type === 'owed_by_me'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30 border border-transparent'
              }`}
            >
              <Landmark className="size-4" />
              I Borrowed (I owe)
            </button>
            <button
              type="button"
              onClick={() => setType('owed_to_me')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                type === 'owed_to_me'
                  ? 'bg-violet-500/15 text-violet-400 border border-violet-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30 border border-transparent'
              }`}
            >
              <Landmark className="size-4" />
              I Lent (They owe)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Person Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block ml-1">
                Person / Entity
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <User className="size-4" />
                </span>
                <Input
                  type="text"
                  required
                  value={person}
                  onChange={(e) => setPerson(e.target.value)}
                  placeholder="e.g., John Doe"
                  className="pl-9 bg-black/45 border-slate-800 focus-visible:border-indigo-500/50 focus-visible:ring-indigo-500/10 h-10 rounded-xl text-slate-200"
                />
              </div>
            </div>

            {/* Total Amount */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block ml-1">
                Loan Amount
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm font-bold text-slate-500 select-none">
                  ₦
                </span>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-9 bg-black/45 border-slate-800 focus-visible:border-indigo-500/50 focus-visible:ring-indigo-500/10 h-10 rounded-xl text-slate-200 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block ml-1">
                Reason / Note (Optional)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <FileText className="size-4" />
                </span>
                <Input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Dinner split"
                  className="pl-9 bg-black/45 border-slate-800 focus-visible:border-indigo-500/50 focus-visible:ring-indigo-500/10 h-10 rounded-xl text-slate-200"
                />
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block ml-1">
                Due Date (Optional)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Calendar className="size-4" />
                </span>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="pl-9 bg-black/45 border-slate-800 focus-visible:border-indigo-500/50 focus-visible:ring-indigo-500/10 h-10 rounded-xl text-slate-200"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold h-10 rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-300 mt-2"
          >
            {isPending ? 'Saving...' : 'Add Debt / Loan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

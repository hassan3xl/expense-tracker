'use client';

import React, { useActionState, startTransition } from 'react';
import Link from 'next/link';
import { registerAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Wallet, UserPlus, Lock, User, AlertCircle, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, undefined);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-black text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
        {/* Logo/Brand Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center size-12 rounded-2xl bg-indigo-600/25 border border-indigo-500/30 shadow-lg shadow-indigo-500/10 mb-3 backdrop-blur-md">
            <Wallet className="size-6 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-slate-100 to-indigo-200">
            AuraFinance
          </h1>
          <p className="text-slate-400 text-sm mt-1">Take control of your money</p>
        </div>

        <Card className="border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shadow-2xl shadow-black/40 rounded-3xl overflow-hidden">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-slate-100">Create Account</CardTitle>
            <CardDescription className="text-slate-400">
              Sign up today and start tracking your debts and expenses.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {state?.error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-300 text-sm animate-in fade-in zoom-in-95 duration-200">
                  <AlertCircle className="size-5 shrink-0 text-rose-400 mt-0.5" />
                  <span>{state.error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block ml-1" htmlFor="username">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <User className="size-4" />
                  </span>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    placeholder="Choose a username"
                    className="pl-9 bg-black/45 border-slate-800 focus-visible:border-indigo-500/50 focus-visible:ring-indigo-500/10 h-10 rounded-xl text-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block ml-1" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Lock className="size-4" />
                  </span>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Create a password (min. 6 chars)"
                    className="pl-9 bg-black/45 border-slate-800 focus-visible:border-indigo-500/50 focus-visible:ring-indigo-500/10 h-10 rounded-xl text-slate-200"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium h-10 rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-300 flex items-center justify-center gap-2 group mt-2"
              >
                {isPending ? (
                  <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Register</span>
                    <UserPlus className="size-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 pt-2 pb-6 border-t border-slate-800/40 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 group/link transition-colors"
              >
                <ArrowLeft className="size-3 group-hover/link:-translate-x-0.5 transition-transform" />
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

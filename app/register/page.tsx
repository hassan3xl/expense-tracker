"use client";

import React, { useActionState, startTransition } from "react";
import Link from "next/link";
import { registerAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Wallet,
  UserPlus,
  Lock,
  User,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    undefined,
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/25">
            <Wallet className="size-6 text-primary" />
          </div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Pennywise
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Take control of your money
          </p>
        </div>

        <Card className="ring-1 ring-border">
          <CardHeader className="gap-1.5">
            <CardTitle className="text-lg">Create account</CardTitle>
            <CardDescription>
              Sign up today and start tracking your debts and expenses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {state?.error && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive animate-in fade-in zoom-in-95 duration-200"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{state.error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label
                  className="ml-0.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  htmlFor="username"
                >
                  Username
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-muted-foreground">
                    <User className="size-4" />
                  </span>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    placeholder="Choose a username"
                    className="h-11 pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  className="ml-0.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-muted-foreground">
                    <Lock className="size-4" />
                  </span>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Create a password (min. 6 chars)"
                    className="h-11 pl-9"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="group mt-1 flex h-11 w-full items-center justify-center gap-2"
              >
                {isPending ? (
                  <div className="size-5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                ) : (
                  <>
                    <span>Register</span>
                    <UserPlus className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="group/link inline-flex items-center gap-1 font-medium text-primary transition-colors hover:text-primary/80"
              >
                <ArrowLeft className="size-3 transition-transform group-hover/link:-translate-x-0.5" />
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

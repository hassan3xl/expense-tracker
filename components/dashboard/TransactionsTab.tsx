"use client";

import React, { useState } from "react";
import {
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";
import { formatCurrency, formatDate } from "../../lib/utils";
import { PageHeader } from "../ui/page-header";
import { useFinance } from "@/lib/finance-context";
import { DashboardSkeleton } from "@/components/loading/DashboardSkeleton";

export function TransactionsTab() {
  const {
    transactions = [],
    accounts = [],
    setIsAddTransactionOpen,
    handleDeleteTransaction,
    isInitialized,
  } = useFinance();

  if (!isInitialized) {
    return <DashboardSkeleton />;
  }

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [accountFilter, setAccountFilter] = useState<string>("ALL");

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(search.toLowerCase()) ||
      (tx.payee && tx.payee.toLowerCase().includes(search.toLowerCase())) ||
      (tx.categoryName &&
        tx.categoryName.toLowerCase().includes(search.toLowerCase()));

    const matchesType = typeFilter === "ALL" || tx.type === typeFilter;
    const matchesAccount =
      accountFilter === "ALL" || tx.accountId === accountFilter;

    return matchesSearch && matchesType && matchesAccount;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Transaction History"
        description="Search, filter, and manage all your income and expenses."
        action={
          <Button
            onClick={() => setIsAddTransactionOpen(true)}
            variant="gradient"
            size="sm"
          >
            <Plus className="h-4 w-4" /> New Transaction
          </Button>
        }
      />
      {/* Header controls & filters */}
      <Card className="glass-card">
        <CardContent className="p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search description, payee, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
            {/* Type selector */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-36 h-10 text-xs sm:text-sm">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
                <SelectItem value="TRANSFER">Transfer</SelectItem>
              </SelectContent>
            </Select>

            {/* Account selector */}
            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger className="w-full sm:w-44 h-10 text-xs sm:text-sm">
                <SelectValue placeholder="All Accounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Accounts</SelectItem>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={() => setIsAddTransactionOpen(true)}
              variant="gradient"
              size="sm"
              className="col-span-2 sm:col-span-1 h-10"
            >
              <Plus className="h-4 w-4" /> Add Transaction
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Transactions List</CardTitle>
            <p className="text-xs text-muted-foreground">
              Showing {filteredTransactions.length} of {transactions.length}{" "}
              records
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-xs sm:text-sm text-muted-foreground">
              No transactions found matching your filters.
            </div>
          ) : (
            <>
              {/* Mobile Card View (block md:hidden) */}
              <div className="block md:hidden space-y-2.5">
                {filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-9 w-9 rounded-xl flex-shrink-0 flex items-center justify-center">
                        {tx.type === "INCOME" && (
                          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 dark:text-emerald-400 border border-emerald-500/20">
                            <ArrowDownLeft className="h-4 w-4" />
                          </div>
                        )}
                        {tx.type === "EXPENSE" && (
                          <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 dark:text-rose-400 border border-rose-500/20">
                            <ArrowUpRight className="h-4 w-4" />
                          </div>
                        )}
                        {tx.type === "TRANSFER" && (
                          <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500 dark:text-cyan-400 border border-cyan-500/20">
                            <RefreshCw className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs sm:text-sm text-foreground truncate">
                          {tx.description}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                          <Badge
                            variant="secondary"
                            className="text-[9px] px-1.5 py-0 font-normal"
                          >
                            {tx.categoryName}
                          </Badge>
                          <span>•</span>
                          <span className="truncate">{tx.accountName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <div
                          className={`font-bold text-xs sm:text-sm ${
                            tx.type === "INCOME"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-foreground"
                          }`}
                        >
                          {tx.type === "INCOME" ? "+" : "-"}
                          {formatCurrency(tx.amount)}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {formatDate(tx.date)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                        onClick={() => handleDeleteTransaction(tx.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View (hidden md:block) */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          {tx.type === "INCOME" && (
                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 dark:text-emerald-400 border border-emerald-500/20">
                              <ArrowDownLeft className="h-4 w-4" />
                            </div>
                          )}
                          {tx.type === "EXPENSE" && (
                            <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 dark:text-rose-400 border border-rose-500/20">
                              <ArrowUpRight className="h-4 w-4" />
                            </div>
                          )}
                          {tx.type === "TRANSFER" && (
                            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500 dark:text-cyan-400 border border-cyan-500/20">
                              <RefreshCw className="h-4 w-4" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-foreground">
                            {tx.description}
                          </div>
                          {tx.payee && (
                            <div className="text-xs text-muted-foreground">
                              {tx.payee}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {tx.categoryName}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {tx.accountName}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(tx.date)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-bold text-sm ${
                            tx.type === "INCOME"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-foreground"
                          }`}
                        >
                          {tx.type === "INCOME" ? "+" : "-"}
                          {formatCurrency(tx.amount)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                            onClick={() => handleDeleteTransaction(tx.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

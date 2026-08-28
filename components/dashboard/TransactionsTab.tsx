"use client";

import React, { useState } from "react";
import {
  Search,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  Coins,
  LayoutGrid,
  List,
  Store,
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
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../ui/table";
import { formatCurrency, formatDate } from "../../lib/utils";
import { PageHeader } from "../ui/page-header";
import { useFinance } from "@/lib/finance-context";
import { DashboardSkeleton } from "@/components/loading/DashboardSkeleton";
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal";
import { CollectPaymentModal } from "@/components/modals/CollectPaymentModal";
import { TransactionItem } from "@/lib/mock-data";
import { TransactionCard } from "./TransactionCard";

export function TransactionsTab() {
  const {
    transactions = [],
    accounts = [],
    setIsAddTransactionOpen,
    handleDeleteTransaction,
    handleTogglePendingTransaction,
    handlePartialCollectTransaction,
    isInitialized,
  } = useFinance();

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [collectTarget, setCollectTarget] = useState<TransactionItem | null>(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [accountFilter, setAccountFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  if (!isInitialized) {
    return <DashboardSkeleton />;
  }

  const pendingIncomeTotal = transactions
    .filter((tx) => tx.isPending && tx.type === "INCOME")
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Filter and sort transactions strictly most recent first
  const filteredTransactions = transactions
    .filter((tx) => {
      const matchesSearch =
        tx.description.toLowerCase().includes(search.toLowerCase()) ||
        (tx.payee && tx.payee.toLowerCase().includes(search.toLowerCase())) ||
        (tx.categoryName &&
          tx.categoryName.toLowerCase().includes(search.toLowerCase()));

      const matchesType = typeFilter === "ALL" || tx.type === typeFilter;
      const matchesAccount =
        accountFilter === "ALL" || tx.accountId === accountFilter;
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "PENDING" && tx.isPending) ||
        (statusFilter === "CLEARED" && !tx.isPending);

      return matchesSearch && matchesType && matchesAccount && matchesStatus;
    })
    .sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      if (timeB !== timeA) return timeB - timeA;
      return (b.id || "").localeCompare(a.id || "");
    });

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Transaction History"
        description="Search, filter, and manage all your transactions."
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
        <CardContent className="p-1 sm:p-2 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
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

            {/* Status selector */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36 h-10 text-xs sm:text-sm">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="CLEARED">Cleared / Paid</SelectItem>
                <SelectItem value="PENDING">Pending Payment</SelectItem>
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

      {/* Pending Income Alert Banner */}
      {pendingIncomeTotal > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">
                Expected Pending Income
              </h4>
              <p className="text-xs text-muted-foreground">
                You have unpaid freelance jobs / invoices totaling{" "}
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(pendingIncomeTotal)}
                </span>
                . Collect payments partially or mark as paid as funds arrive.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <Card className="glass-card">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          <div>
            <CardTitle className="text-base">Transactions List</CardTitle>
            <p className="text-xs text-muted-foreground">
              Showing {filteredTransactions.length} of {transactions.length}{" "}
              records (Sorted most recent first)
            </p>
          </div>

          {/* Cards / Table View Toggle Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900/90 p-1 rounded-xl border border-slate-200 dark:border-zinc-800 self-start sm:self-auto">
            <Button
              variant={viewMode === "cards" ? "secondary" : "ghost"}
              size="sm"
              className={`h-8 px-3 text-xs font-semibold gap-1.5 rounded-lg transition-all ${
                viewMode === "cards"
                  ? "bg-white dark:bg-zinc-800 text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setViewMode("cards")}
            >
              <LayoutGrid className="h-3.5 w-3.5 text-emerald-500" /> Card View
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              className={`h-8 px-3 text-xs font-semibold gap-1.5 rounded-lg transition-all ${
                viewMode === "table"
                  ? "bg-white dark:bg-zinc-800 text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setViewMode("table")}
            >
              <List className="h-3.5 w-3.5 text-emerald-500" /> Table View
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-10 text-xs sm:text-sm text-muted-foreground">
              No transactions found matching your filters.
            </div>
          ) : viewMode === "cards" ? (
            /* Cards View (Grid for both Mobile and Desktop) */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
              {filteredTransactions.map((tx) => (
                <TransactionCard
                  key={tx.id}
                  transaction={tx}
                  onCollect={(target) => setCollectTarget(target)}
                  onTogglePending={(id) => handleTogglePendingTransaction(id)}
                  onDelete={(id, name) => setDeleteTarget({ id, name })}
                />
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Type</TableHead>
                    <TableHead>Description & Payee</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-48 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => (
                    <TableRow
                      key={tx.id}
                      className={`transition-colors ${
                        tx.type === "INCOME"
                          ? "border-l-4 border-l-emerald-500"
                          : tx.type === "EXPENSE"
                          ? "border-l-4 border-l-rose-500"
                          : "border-l-4 border-l-cyan-500"
                      }`}
                    >
                      <TableCell>
                        {tx.type === "INCOME" && (
                          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                            Income
                          </Badge>
                        )}
                        {tx.type === "EXPENSE" && (
                          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold text-[10px]">
                            Expense
                          </Badge>
                        )}
                        {tx.type === "TRANSFER" && (
                          <Badge className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-bold text-[10px]">
                            Transfer
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          {tx.description}
                          {tx.isPending && (
                            <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] gap-1 font-semibold">
                              <Clock className="h-3 w-3" /> Pending
                            </Badge>
                          )}
                        </div>
                        {tx.payee ? (
                          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                            <Store className="h-3 w-3 shrink-0" /> Payee / Merchant: {tx.payee}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground italic mt-0.5">
                            No payee specified
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {tx.categoryName || "General"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {tx.accountName}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {formatDate(tx.date)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-bold text-sm ${
                          tx.type === "INCOME"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : tx.type === "EXPENSE"
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-foreground"
                        }`}
                      >
                        {tx.type === "INCOME"
                          ? "+"
                          : tx.type === "EXPENSE"
                          ? "-"
                          : ""}
                        {formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {tx.isPending ? (
                            <>
                              <Button
                                size="sm"
                                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1 px-2.5"
                                onClick={() => setCollectTarget(tx)}
                              >
                                <Coins className="h-3.5 w-3.5" /> Collect
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs font-semibold gap-1 px-2"
                                onClick={() =>
                                  handleTogglePendingTransaction(tx.id)
                                }
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                Full Paid
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-[11px] text-muted-foreground hover:text-amber-500"
                              onClick={() =>
                                handleTogglePendingTransaction(tx.id)
                              }
                              title="Revert to Pending"
                            >
                              Unpay
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                            onClick={() =>
                              setDeleteTarget({
                                id: tx.id,
                                name: tx.description,
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collect Partial/Full Payment Modal */}
      <CollectPaymentModal
        isOpen={Boolean(collectTarget)}
        onClose={() => setCollectTarget(null)}
        transaction={collectTarget}
        accounts={accounts}
        onConfirm={handlePartialCollectTransaction}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) handleDeleteTransaction(deleteTarget.id);
        }}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction record? Your account balance will be updated automatically."
        itemName={deleteTarget?.name}
      />
    </div>
  );
}

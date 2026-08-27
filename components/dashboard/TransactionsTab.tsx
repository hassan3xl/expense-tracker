"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
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
import {
  AccountItem,
  CategoryItem,
  TransactionItem,
} from "../../lib/mock-data";

interface TransactionsTabProps {
  transactions: TransactionItem[];
  accounts: AccountItem[];
  categories: CategoryItem[];
  onOpenAddTransaction: () => void;
  onDeleteTransaction: (id: string) => void;
}

export function TransactionsTab({
  transactions,
  accounts,
  categories,
  onOpenAddTransaction,
  onDeleteTransaction,
}: TransactionsTabProps) {
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
    <div className="space-y-6">
      {/* Header controls & filters */}
      <Card className="glass-card">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search description, payee, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Type selector */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36">
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
              <SelectTrigger className="w-44">
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

            <Button onClick={onOpenAddTransaction} variant="gradient" size="sm">
              <Plus className="h-4 w-4" /> Add Transaction
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Transactions List</CardTitle>
            <p className="text-xs text-slate-400">
              Showing {filteredTransactions.length} of {transactions.length}{" "}
              records
            </p>
          </div>
        </CardHeader>
        <CardContent>
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
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-slate-400"
                  >
                    No transactions found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      {tx.type === "INCOME" && (
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                          <ArrowDownLeft className="h-4 w-4" />
                        </div>
                      )}
                      {tx.type === "EXPENSE" && (
                        <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                      )}
                      {tx.type === "TRANSFER" && (
                        <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                          <Search className="h-4 w-4" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-white">
                        {tx.description}
                      </div>
                      {tx.payee && (
                        <div className="text-xs text-slate-400">{tx.payee}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {tx.categoryName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-300">
                      {tx.accountName}
                    </TableCell>
                    <TableCell className="text-xs text-slate-400">
                      {formatDate(tx.date)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold text-sm ${
                        tx.type === "INCOME"
                          ? "text-emerald-400"
                          : "text-slate-200"
                      }`}
                    >
                      {tx.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                        onClick={() => onDeleteTransaction(tx.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

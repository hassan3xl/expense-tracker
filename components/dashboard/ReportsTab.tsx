"use client";

import React, { useState } from "react";
import { Download, Calendar, Store } from "lucide-react";
import { TransactionCard } from "./TransactionCard";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";
import { formatCurrency, formatDate, exportToCSV } from "../../lib/utils";
import { useFinance } from "@/lib/finance-context";
import { PageHeader } from "../ui/page-header";
import { DashboardSkeleton } from "@/components/loading/DashboardSkeleton";
import { toast } from "@/components/ui/sonner";

export function ReportsTab() {
  const { transactions = [], isInitialized } = useFinance();
  const [startDate, setStartDate] = useState("2026-08-01");
  const [endDate, setEndDate] = useState("2026-08-31");

  if (!isInitialized) {
    return <DashboardSkeleton />;
  }

  // Filter transactions by user-defined date range
  const filtered = transactions.filter((tx) => {
    if (!startDate && !endDate) return true;
    const txDate = new Date(tx.date).getTime();
    const start = startDate ? new Date(startDate).getTime() : 0;
    const end = endDate ? new Date(endDate).getTime() + 86400000 : Infinity;
    return txDate >= start && txDate <= end;
  });

  const totalIncome = filtered
    .filter((tx) => tx.type === "INCOME")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = filtered
    .filter((tx) => tx.type === "EXPENSE")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netDifference = totalIncome - totalExpense;

  const handleExportCSV = () => {
    const dataToExport = filtered.map((tx) => ({
      ID: tx.id,
      Date: tx.date,
      Description: tx.description,
      Type: tx.type,
      Category: tx.categoryName || "Uncategorized",
      Account: tx.accountName || "Main Account",
      Payee: tx.payee || "",
      Amount: tx.amount,
    }));

    exportToCSV(
      `financial_report_${startDate}_to_${endDate}.csv`,
      dataToExport,
    );
    toast.success(`Exported ${dataToExport.length} transactions to CSV!`);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Financial Reports"
        description="Generate and export CSV reports for custom date ranges."
        action={
          <Button onClick={handleExportCSV} variant="gradient" size="sm">
            <Download className="h-4 w-4" /> Export CSV Report
          </Button>
        }
      />
      {/* Date Range Filter Card */}
      <Card className="glass-card">
        <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Calendar className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-foreground">
              Filter Date Range:
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5">
              <Label className="text-xs shrink-0">From:</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full sm:w-36 h-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Label className="text-xs shrink-0">To:</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full sm:w-36 h-9 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground uppercase">
              Selected Period Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalIncome)}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground uppercase">
              Selected Period Expenditure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-extrabold text-rose-600 dark:text-rose-400">
              {formatCurrency(totalExpense)}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground uppercase">
              Net Financial Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-xl sm:text-2xl font-extrabold ${
                netDifference >= 0
                  ? "text-teal-600 dark:text-teal-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {formatCurrency(netDifference)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Table / Cards */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Filtered Report Records</CardTitle>
            <p className="text-xs text-muted-foreground">
              Found {filtered.length} entries between {startDate} and {endDate}
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No transactions found for the selected date range.
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="block md:hidden space-y-3">
                {filtered.map((tx) => (
                  <TransactionCard
                    key={tx.id}
                    transaction={tx}
                    showActions={false}
                    compact={true}
                  />
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description & Payee</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {formatDate(tx.date)}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                          <div>{tx.description}</div>
                          {tx.payee && (
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                              <Store className="h-3 w-3 shrink-0" /> Payee / Merchant: {tx.payee}
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
                        <TableCell>
                          <Badge
                            variant={tx.type === "INCOME" ? "income" : "expense"}
                            className="text-[11px]"
                          >
                            {tx.type}
                          </Badge>
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

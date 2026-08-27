"use client";

import React, { useState } from "react";
import { Download, Calendar } from "lucide-react";
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

export function ReportsTab() {
  const { transactions = [] } = useFinance();
  const [startDate, setStartDate] = useState("2026-08-01");
  const [endDate, setEndDate] = useState("2026-08-31");

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
  };

  return (
    <div className="space-y-6">
      {/* Date Range Filter Header */}
      <Card className="glass-card">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Calendar className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <CardTitle className="text-base">
                Financial Report Generator
              </CardTitle>
              <p className="text-xs text-slate-400">
                Generate and export CSV reports for custom date ranges.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Label className="text-xs">From:</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-36 h-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs">To:</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-36 h-9 text-xs"
              />
            </div>

            <Button onClick={handleExportCSV} variant="gradient" size="sm">
              <Download className="h-4 w-4" /> Export CSV Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-slate-400 uppercase">
              Selected Period Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-emerald-400">
              {formatCurrency(totalIncome)}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-slate-400 uppercase">
              Selected Period Expenditure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-rose-400">
              {formatCurrency(totalExpense)}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-slate-400 uppercase">
              Net Financial Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-extrabold ${
                netDifference >= 0 ? "text-teal-400" : "text-rose-400"
              }`}
            >
              {formatCurrency(netDifference)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Table */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Filtered Report Records</CardTitle>
            <p className="text-xs text-slate-400">
              Found {filtered.length} entries between {startDate} and {endDate}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-slate-400"
                  >
                    No transactions found for the selected date range.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-xs text-slate-400 font-mono">
                      {formatDate(tx.date)}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900 dark:text-white">
                      {tx.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {tx.categoryName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-300">
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
                          ? "text-emerald-400"
                          : "text-slate-200"
                      }`}
                    >
                      {tx.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
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

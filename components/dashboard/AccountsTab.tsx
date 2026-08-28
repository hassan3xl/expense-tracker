"use client";

import React, { useState } from "react";
import { Plus, Wallet, Pencil } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { formatCurrency } from "../../lib/utils";
import { useFinance } from "@/lib/finance-context";
import { PageHeader } from "../ui/page-header";
import { DashboardSkeleton } from "@/components/loading/DashboardSkeleton";
import { EditAccountModal } from "@/components/modals/EditAccountModal";
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal";
import { AccountItem } from "@/lib/mock-data";

export function AccountsTab() {
  const {
    accounts = [],
    setIsAddAccountOpen,
    handleEditAccount,
    handleDeleteAccount,
    isInitialized,
  } = useFinance();

  const [editingAccount, setEditingAccount] = useState<AccountItem | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  if (!isInitialized) {
    return <DashboardSkeleton />;
  }

  const totalAssets = accounts
    .filter((a) => a.balance > 0)
    .reduce((sum, a) => sum + a.balance, 0);

  const totalLiabilities = Math.abs(
    accounts
      .filter((a) => a.balance < 0)
      .reduce((sum, a) => sum + a.balance, 0),
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Accounts & Assets"
        description="Manage checking, savings, credit cards, and investments."
        action={
          <Button
            onClick={() => setIsAddAccountOpen(true)}
            variant="gradient"
            size="sm"
          >
            <Plus className="h-4 w-4" /> Add Account
          </Button>
        }
      />

      {/* Account Overview Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-emerald-400">
              {formatCurrency(totalAssets)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cash, savings, & investments
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Liabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-rose-400">
              {formatCurrency(totalLiabilities)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Credit cards & loans
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Account Cards Grid */}
      {accounts.length === 0 ? (
        <Card className="glass-card p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500 dark:text-emerald-400">
            <Wallet className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              No Accounts Found
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              Start by adding your bank account, checking, savings, cash, or
              credit card to track your live balance.
            </p>
          </div>
          <Button
            onClick={() => setIsAddAccountOpen(true)}
            variant="gradient"
            size="sm"
          >
            <Plus className="h-4 w-4" /> Add Your First Account
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((acc) => (
            <Card
              key={acc.id}
              className="glass-card glass-card-hover border-slate-200 dark:border-zinc-800 relative overflow-hidden flex flex-col justify-between"
            >
              {/* Top color accent stripe */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: acc.color }}
              />

              <div>
                <CardHeader className="flex flex-row items-center justify-between pt-6 pb-2">
                  <div>
                    <Badge
                      variant="secondary"
                      className="text-[10px] uppercase font-bold tracking-wider mb-1"
                    >
                      {acc.type.replace("_", " ")}
                    </Badge>
                    <CardTitle className="text-lg">{acc.name}</CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-xs gap-1.5 border-slate-200 dark:border-zinc-700/80 hover:bg-slate-100 dark:hover:bg-zinc-800"
                    onClick={() => setEditingAccount(acc)}
                  >
                    <Pencil className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />{" "}
                    Edit
                  </Button>
                </CardHeader>

                <CardContent className="pt-2 pb-6">
                  <div>
                    <span className="text-xs text-muted-foreground font-medium">
                      Current Balance
                    </span>
                    <div
                      className={`text-2xl font-black ${
                        acc.balance < 0
                          ? "text-rose-500 dark:text-rose-400"
                          : "text-foreground"
                      }`}
                    >
                      {formatCurrency(acc.balance)}
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Account Modal */}
      <EditAccountModal
        account={editingAccount}
        isOpen={Boolean(editingAccount)}
        onClose={() => setEditingAccount(null)}
        onEditAccount={(id, updated) => handleEditAccount(id, updated)}
        onDeleteAccount={(id) => {
          const acc = accounts.find((a) => a.id === id);
          if (acc) {
            setDeleteTarget({ id: acc.id, name: acc.name });
          }
        }}
      />

      {/* Confirm Delete Account Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            handleDeleteAccount(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Delete Account"
        description="Are you sure you want to delete this account? All associated transactions will also be permanently removed."
        itemName={deleteTarget?.name}
      />
    </div>
  );
}

"use client";

import React, { Suspense } from "react";
import { FinanceProvider, useFinance } from "@/lib/finance-context";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NavigationProgress } from "@/components/loading/NavigationProgress";
import { AddTransactionModal } from "@/components/modals/AddTransactionModal";
import { AddAccountModal } from "@/components/modals/AddAccountModal";
import { AddBudgetModal } from "@/components/modals/AddBudgetModal";
import { AddGoalModal } from "@/components/modals/AddGoalModal";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const {
    accounts,
    categories,
    isAddTransactionOpen,
    setIsAddTransactionOpen,
    isAddAccountOpen,
    setIsAddAccountOpen,
    isAddBudgetOpen,
    setIsAddBudgetOpen,
    isAddGoalOpen,
    setIsAddGoalOpen,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    handleAddTransaction,
    handleAddAccount,
    handleAddBudget,
    handleAddGoal,
  } = useFinance();

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors">
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>

      {/* Sidebar */}
      <Sidebar
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-3.5 sm:p-6 max-w-7xl w-full mx-auto space-y-4 sm:space-y-6">
          {children}
        </main>

        {/* System Footer */}
        <Footer />
      </div>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddTransactionOpen}
        onClose={() => setIsAddTransactionOpen(false)}
        onAddTransaction={handleAddTransaction}
        accounts={accounts}
        categories={categories}
      />

      <AddAccountModal
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
        onAddAccount={handleAddAccount}
      />

      <AddBudgetModal
        isOpen={isAddBudgetOpen}
        onClose={() => setIsAddBudgetOpen(false)}
        onAddBudget={handleAddBudget}
        categories={categories}
      />

      <AddGoalModal
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
        onAddGoal={handleAddGoal}
      />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FinanceProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </FinanceProvider>
  );
}

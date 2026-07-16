import React, { Suspense } from "react";
import { getSessionUser, getCurrentProject } from "@/lib/auth";
import { sql } from "@/lib/db";
import Navbar from "@/components/layout/Navbar";
import Header from "@/components/Header";
import DebtFilters from "@/components/debts/DebtFilters";
import ActiveDebts from "@/components/dashboard/ActiveDebts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Landmark, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { Toaster } from "sonner";
import { formatNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface DebtsPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    status?: string;
  }>;
}

export default async function DebtsPage({ searchParams }: DebtsPageProps) {
  const user = await getSessionUser();
  if (!user) return null;

  // Resolve search parameters (Next.js 15+ searchParams is a Promise)
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";
  const type = resolvedParams.type || "";
  const status = resolvedParams.status || "";

  // Get active project and list of all projects
  const currentProj = await getCurrentProject(user.userId);
  const projectsData = await sql`
    SELECT DISTINCT p.id, p.name FROM projects p
    LEFT JOIN project_members pm ON pm.project_id = p.id
    WHERE p.user_id = ${user.userId} OR pm.user_id = ${user.userId}
    ORDER BY p.name ASC
  `;
  const projects = (projectsData || []).map((p) => ({
    id: Number(p.id),
    name: String(p.name),
  }));

  const ilikePattern = `%${q}%`;
  const debtsData = await sql`
    SELECT id, person, type, amount, remaining_amount, description, due_date, status, created_at 
    FROM debts 
    WHERE project_id = ${currentProj.id}
      AND (${q} = '' OR person ILIKE ${ilikePattern} OR description ILIKE ${ilikePattern})
      AND (${type} = '' OR type = ${type})
      AND (${status} = '' OR status = ${status})
    ORDER BY created_at DESC
  `;

  // Cast type results properly
  const debts = (debtsData || []).map((d) => ({
    id: Number(d.id),
    person: String(d.person),
    type: String(d.type),
    amount: String(d.amount),
    remaining_amount: String(d.remaining_amount),
    description: String(d.description || ""),
    due_date: d.due_date ? String(d.due_date) : null,
    status: String(d.status),
    created_at: String(d.created_at),
  }));

  // Calculations for current selection
  let totalLent = 0;
  let totalBorrowed = 0;

  debts.forEach((d) => {
    if (d.status === "active") {
      const remaining = parseFloat(d.remaining_amount);
      if (d.type === "owed_to_me") totalLent += remaining;
      else if (d.type === "owed_by_me") totalBorrowed += remaining;
    }
  });

  return (
    <main className="">
      <Header
        title="Debts & Loans Management"
        subtitle="View, record payments, and track history of borrow and lend amounts."
        showRefresh={false}
        actions={
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-card border border-border text-xs font-semibold text-muted-foreground">
            <Landmark className="size-4 text-primary" />
            <span>Total Loan records: {debts.length}</span>
          </div>
        }
        stats={[
          {
            title: "Total Outstanding Receivable",
            value: formatNaira(totalLent),
            icon: <ArrowUpRight className="size-4" />,
            iconBg: "bg-violet-500/10 text-violet-400",
          },
          {
            title: "Total Outstanding Payable",
            value: formatNaira(totalBorrowed),
            icon: <ArrowDownRight className="size-4" />,
            iconBg: "bg-amber-500/10 text-amber-400",
          },
        ]}
      />

      <div className="animate-in fade-in duration-500 delay-100">
        <Suspense
          fallback={
            <div className="h-10 bg-muted/30 border border-border rounded-xl animate-pulse" />
          }
        >
          <DebtFilters />
        </Suspense>
      </div>

      {/* Debts List Card */}
      <div>
        <Card className="hidden md:block border border-border bg-card text-card-foreground rounded-3xl p-5 sm:p-6 shadow-xl shadow-black/5">
          <CardHeader className="px-0 pt-0 pb-4">
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Landmark className="size-5 text-primary" />
              Loans & Debts History
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ActiveDebts
              debts={debts}
              readOnly={currentProj.role === "viewer"}
            />
          </CardContent>
        </Card>

        {/* mobile view */}
        <div className="md:hidden">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Debts & Loans</h2>
          <ActiveDebts debts={debts} readOnly={currentProj.role === "viewer"} />
        </div>
      </div>
    </main>
  );
}

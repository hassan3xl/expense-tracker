"use client";

import React, { useState, useTransition } from "react";
import { updateProjectSettingsAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Settings, ShieldAlert, Sparkles, HelpCircle } from "lucide-react";
import { toast } from "sonner";

interface SettingsFormProps {
  currentProject: {
    id: number;
    name: string;
    role: "owner" | "editor" | "viewer";
    autoLogDebtTransaction: boolean;
  };
}

export default function SettingsForm({ currentProject }: SettingsFormProps) {
  const [autoLogDebtTransaction, setAutoLogDebtTransaction] = useState(
    currentProject.autoLogDebtTransaction
  );
  const [isPending, startTransition] = useTransition();

  const isOwner = currentProject.role === "owner";

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      toast.error("Only the project owner can change project settings");
      return;
    }

    startTransition(async () => {
      try {
        await updateProjectSettingsAction({ autoLogDebtTransaction });
        toast.success("Project settings updated successfully!");
      } catch (err: any) {
        toast.error(err.message || "Failed to update project settings");
      }
    });
  };

  return (
    <div className="space-y-6">
      {!isOwner && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-sm font-semibold text-amber-400">
          <ShieldAlert className="size-5 shrink-0" />
          <div>
            <p>Read-Only Settings</p>
            <p className="text-xs text-amber-400/80 font-normal mt-0.5">
              Only the project owner can modify settings. Your current role is{" "}
              <span className="font-bold uppercase">{currentProject.role}</span>.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border border-border bg-card text-card-foreground rounded-3xl overflow-hidden shadow-xl shadow-black/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Settings className="size-5 text-primary" />
              General Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Setting: Auto Log Debt Transaction */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-background">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">
                    Auto-log transactions on debt creation
                  </span>
                  <div className="group relative">
                    <HelpCircle className="size-4 text-muted-foreground cursor-help" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-popover border border-border rounded-xl text-xs text-popover-foreground shadow-xl hidden group-hover:block z-50">
                      <p className="font-semibold mb-1">How it works:</p>
                      <p className="text-muted-foreground leading-relaxed">
                        If enabled, logging a debt creates a matching transaction
                        (Lent = Expense, Borrowed = Income) to affect your Cash on Hand immediately.
                        Disable this for shops/businesses where debts represent service credit, not direct cash flow.
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  When you record a new loan/debt, automatically log an initial income or expense transaction.
                </p>
              </div>

              {/* Styled Switch Toggle */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  disabled={!isOwner}
                  onClick={() => setAutoLogDebtTransaction(!autoLogDebtTransaction)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    autoLogDebtTransaction ? "bg-primary" : "bg-muted"
                  } ${!isOwner ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-foreground shadow ring-0 transition duration-200 ease-in-out ${
                      autoLogDebtTransaction ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground min-w-[32px] select-none">
                  {autoLogDebtTransaction ? "ON" : "OFF"}
                </span>
              </div>
            </div>

            {/* Hint Box */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10 text-xs font-medium text-muted-foreground leading-relaxed">
              <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground">Usage Hint:</span>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li>
                    For <span className="text-foreground font-bold">Personal finance</span> projects, keeping this <span className="text-emerald-400 font-bold">ON</span> is recommended so cash outflow is registered instantly when lending money.
                  </li>
                  <li>
                    For <span className="text-foreground font-bold">Business / Shop</span> projects (like a Game Shop), turning this <span className="text-rose-400 font-bold">OFF</span> is recommended. Customers playing games on credit will have their debts logged without prematurely reducing your current recorded earnings.
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {isOwner && (
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-primary text-primary-foreground border border-primary hover:bg-primary/90 px-6 h-11 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
            >
              {isPending ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

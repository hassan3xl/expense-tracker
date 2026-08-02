import React from "react";
import { getSessionUser, getCurrentProject } from "@/lib/auth";
import Header from "@/components/Header";
import SettingsForm from "@/components/settings/SettingsForm";
import { Settings } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Project Settings",
  description: "Configure calculation rules and transaction logging preferences for your projects.",
};

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const currentProj = await getCurrentProject(user.userId);

  return (
    <main>
      <Header
        title="Project Settings"
        subtitle={`Configure behavior rules for your active project: ${currentProj.name}`}
        showRefresh={false}
        actions={
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-card border border-border text-xs font-semibold text-muted-foreground">
            <Settings className="size-4 text-primary" />
            <span>Active ID: {currentProj.id}</span>
          </div>
        }
      />

      <SettingsForm currentProject={currentProj} />
    </main>
  );
}

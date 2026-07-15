"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Users,
  Trash2,
  UserPlus,
  Loader2,
  Shield,
  Eye,
  Edit3,
} from "lucide-react";
import {
  getProjectMembersAction,
  addProjectMemberAction,
  removeProjectMemberAction,
  updateProjectMemberRoleAction,
} from "@/app/actions";

// We'll import dialog from components/ui/dialog correctly
import {
  Dialog as UIDialog,
  DialogContent as UIDialogContent,
  DialogHeader as UIDialogHeader,
  DialogTitle as UIDialogTitle,
  DialogDescription as UIDialogDescription,
  DialogTrigger as UIDialogTrigger,
} from "@/components/ui/dialog";

interface Member {
  id: number;
  userId: number;
  username: string;
  role: string;
}

interface Owner {
  id: number;
  username: string;
  role: string;
}

interface ManageMembersDialogProps {
  projectId: number;
  projectName: string;
  children: React.ReactElement;
}

export default function ManageMembersDialog({
  projectId,
  projectName,
  children,
}: ManageMembersDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null); // holds userId being edited/removed
  const [inviting, setInviting] = useState(false);

  const [owner, setOwner] = useState<Owner | null>(null);
  const [members, setMembers] = useState<Member[]>([]);

  // Invite Form State
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await getProjectMembersAction(projectId);
      setOwner(data.owner);
      setMembers(data.members);
    } catch (error: any) {
      toast.error(error.message || "Failed to load project members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadMembers();
    }
  }, [open, projectId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setInviting(true);
    try {
      await addProjectMemberAction(projectId, username.trim(), role);
      toast.success(`Successfully added ${username} to the project`);
      setUsername("");
      loadMembers();
    } catch (error: any) {
      toast.error(error.message || "Failed to add member");
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (userId: number, memberName: string) => {
    if (
      !confirm(
        `Are you sure you want to remove ${memberName} from this project?`,
      )
    ) {
      return;
    }
    setActionLoading(userId);
    try {
      await removeProjectMemberAction(projectId, userId);
      toast.success(`Removed ${memberName} from project`);
      loadMembers();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove member");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (
    userId: number,
    newRole: "editor" | "viewer",
  ) => {
    setActionLoading(userId);
    try {
      await updateProjectMemberRoleAction(projectId, userId, newRole);
      toast.success("Member role updated");
      loadMembers();
    } catch (error: any) {
      toast.error(error.message || "Failed to update role");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <UIDialog open={open} onOpenChange={setOpen}>
      <UIDialogTrigger render={children} />
      <UIDialogContent className="sm:max-w-md border border-slate-800 bg-zinc-950 text-slate-100 rounded-3xl shadow-2xl p-6">
        <UIDialogHeader>
          <UIDialogTitle className="text-xl font-bold flex items-center gap-2 text-indigo-400">
            <Users className="size-5" />
            Project Collaboration
          </UIDialogTitle>
          <UIDialogDescription className="text-slate-400 text-sm mt-1">
            Manage who can access and edit the project{" "}
            <strong>{projectName}</strong>.
          </UIDialogDescription>
        </UIDialogHeader>

        {/* Add Member Section */}
        <form
          onSubmit={handleInvite}
          className="mt-4 space-y-3 p-4 rounded-2xl border border-slate-800 bg-slate-900/40"
        >
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
            Invite a user
          </h4>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-10 bg-black border-slate-800 text-sm"
              />
            </div>
            <div className="w-full sm:w-32">
              <Input
                as="select"
                value={role}
                onChange={(e) => setRole(e.target.value as "editor" | "viewer")}
                className="h-10 bg-black border-slate-800 text-sm"
              >
                <option value="editor">Editor</option>
                <option value="viewer">Read-Only</option>
              </Input>
            </div>
            <Button
              type="submit"
              disabled={inviting || !username}
              className="h-10 bg-indigo-700 hover:bg-indigo-600 text-slate-100 rounded-xl flex items-center justify-center gap-1.5 px-4 font-semibold text-sm shrink-0"
            >
              {inviting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UserPlus className="size-4" />
              )}
              Invite
            </Button>
          </div>
        </form>

        {/* Member List */}
        <div className="mt-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Project Members
          </h4>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <Loader2 className="size-6 animate-spin text-indigo-400 mb-2" />
              <span className="text-xs">Loading members...</span>
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {/* Owner Item */}
              {owner && (
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800/40 bg-slate-900/10">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm">
                      {owner.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-200">
                        {owner.username}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Owner (Full Access)
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Shield className="size-3" />
                    Owner
                  </span>
                </div>
              )}

              {/* Members list */}
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/20 hover:border-slate-800/80 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-sm">
                      {member.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-200">
                        {member.username}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Added{" "}
                        {new Date().toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Role selector dropdown */}
                    <div className="relative">
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(
                            member.userId,
                            e.target.value as "editor" | "viewer",
                          )
                        }
                        disabled={actionLoading === member.userId}
                        className="bg-black text-slate-300 text-xs border border-slate-800 rounded-lg px-2.5 py-1 outline-none cursor-pointer hover:bg-zinc-900 transition-colors disabled:opacity-50 appearance-none pr-6"
                      >
                        <option value="editor">Editor</option>
                        <option value="viewer">Read-Only</option>
                      </select>
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[10px]">
                        ▼
                      </span>
                    </div>

                    {/* Delete button */}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        handleRemove(member.userId, member.username)
                      }
                      disabled={actionLoading === member.userId}
                      className="text-rose-400 hover:bg-rose-500/10 rounded-lg h-7 w-7"
                    >
                      {actionLoading === member.userId ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}

              {members.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No other members added to this project yet.
                </div>
              )}
            </div>
          )}
        </div>
      </UIDialogContent>
    </UIDialog>
  );
}

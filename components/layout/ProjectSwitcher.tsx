"use client";

import React, { useState, useRef, useEffect } from "react";
import { addProjectAction, switchProjectAction } from "@/app/actions";
import { ChevronDown, Plus, Check, Briefcase, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: number;
  name: string;
}

interface ProjectSwitcherProps {
  initialProjects: Project[];
  currentProject: {
    id: number;
    name: string;
    role?: "owner" | "editor" | "viewer";
    ownerId?: number;
  };
}

export default function ProjectSwitcher({
  initialProjects,
  currentProject,
}: ProjectSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [newProjectName, setNewProjectName] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [switchingId, setSwitchingId] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitchProject = async (id: number, name: string) => {
    if (id === currentProject.id) return;
    try {
      setSwitchingId(id);
      await switchProjectAction(id);
      toast.success(`Switched to project: ${name}`);
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to switch project");
    } finally {
      setSwitchingId(null);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newProjectName.trim();
    if (!name) return;

    try {
      setIsPending(true);
      const newProj = await addProjectAction(name);
      setProjects((prev) =>
        [...prev, newProj].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setNewProjectName("");
      toast.success(`Project "${name}" created!`);
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create project");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm text-foreground hover:bg-muted max-w-[180px] cursor-pointer"
      >
        <Briefcase className="size-4 text-muted-foreground shrink-0" />
        <span className="truncate font-medium">{currentProject.name}</span>
        <ChevronDown
          className={`size-3.5 text-muted-foreground shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-60 rounded-lg border border-border bg-popover p-1.5 shadow-lg z-50">
          <div className="text-xs font-medium text-muted-foreground px-2 py-1.5">
            Switch Project
          </div>

          <div className="max-h-48 overflow-y-auto space-y-0.5 my-1">
            {projects.map((proj) => {
              const isSelected = proj.id === currentProject.id;
              const isSwitching = switchingId === proj.id;

              return (
                <button
                  key={proj.id}
                  onClick={() => handleSwitchProject(proj.id, proj.name)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm text-left ${
                    isSelected
                      ? "bg-muted text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  disabled={isSwitching}
                >
                  <span className="truncate pr-2">{proj.name}</span>
                  {isSwitching ? (
                    <Loader2 className="size-3.5" />
                  ) : isSelected ? (
                    <Check className="size-3.5 shrink-0" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="border-t border-border my-1" />

          {/* New Project Form */}
          <form onSubmit={handleAddProject} className="p-1 space-y-1.5">
            <div className="text-xs font-medium text-muted-foreground px-1">
              Create New
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project name"
                className="flex-1 min-w-0 px-2.5 py-1.5 rounded-md border border-border bg-background text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                disabled={isPending}
              />
              <button
                type="submit"
                disabled={isPending || !newProjectName.trim()}
                className="p-1.5 rounded-md bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40"
              >
                {isPending ? (
                  <Loader2 className="size-3.5" />
                ) : (
                  <Plus className="size-3.5" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

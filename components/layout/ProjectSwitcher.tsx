'use client';

import React, { useState, useRef, useEffect } from 'react';
import { addProjectAction, switchProjectAction } from '@/app/actions';
import { ChevronDown, Plus, Check, Briefcase, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Project {
  id: number;
  name: string;
}

interface ProjectSwitcherProps {
  initialProjects: Project[];
  currentProject: Project;
}

export default function ProjectSwitcher({ initialProjects, currentProject }: ProjectSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [newProjectName, setNewProjectName] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [switchingId, setSwitchingId] = useState<number | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchProject = async (id: number, name: string) => {
    if (id === currentProject.id) return;
    try {
      setSwitchingId(id);
      await switchProjectAction(id);
      toast.success(`Switched to project: ${name}`);
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to switch project');
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
      setProjects((prev) => [...prev, newProj].sort((a, b) => a.name.localeCompare(b.name)));
      setNewProjectName('');
      toast.success(`Project "${name}" created!`);
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create project');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/40 border border-slate-800/60 hover:bg-slate-900/80 hover:border-slate-700/60 text-slate-200 transition-all font-semibold text-sm max-w-[200px]"
      >
        <Briefcase className="size-4 text-indigo-400 shrink-0" />
        <span className="truncate">{currentProject.name}</span>
        <ChevronDown className={`size-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 rounded-2xl border border-slate-800 bg-black/95 backdrop-blur-xl p-2 shadow-2xl shadow-black/80 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2.5 py-1.5">
            Switch Project
          </div>
          
          <div className="max-h-48 overflow-y-auto space-y-1 my-1">
            {projects.map((proj) => {
              const isSelected = proj.id === currentProject.id;
              const isSwitching = switchingId === proj.id;
              
              return (
                <button
                  key={proj.id}
                  onClick={() => handleSwitchProject(proj.id, proj.name)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-600/15 text-indigo-400 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                  disabled={isSwitching}
                >
                  <span className="truncate pr-2">{proj.name}</span>
                  {isSwitching ? (
                    <Loader2 className="size-3.5 animate-spin text-indigo-400" />
                  ) : isSelected ? (
                    <Check className="size-3.5 text-indigo-400 shrink-0" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="border-t border-slate-800 my-1.5" />

          {/* New Project Form */}
          <form onSubmit={handleAddProject} className="p-1 space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">
              Create New Project
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g. Weekly Gathering"
                className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-zinc-950 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
                disabled={isPending}
              />
              <button
                type="submit"
                disabled={isPending || !newProjectName.trim()}
                className="p-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-600 disabled:bg-slate-800/50 disabled:text-slate-600 text-slate-100 transition-colors"
              >
                {isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
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

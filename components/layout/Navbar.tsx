"use client";

import React, { startTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions";
import {
  Wallet,
  LayoutDashboard,
  ReceiptText,
  Landmark,
  LogOut,
  User,
  TrendingUp,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ProjectSwitcher from "./ProjectSwitcher";
import ManageMembersDialog from "./ManageMembersDialog";

interface NavbarProps {
  username: string;
  initialProjects: { id: number; name: string }[];
  currentProject: {
    id: number;
    name: string;
    role?: "owner" | "editor" | "viewer";
    ownerId?: number;
  };
}

export default function Navbar({
  username,
  initialProjects,
  currentProject,
}: NavbarProps) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Transactions", href: "/transactions", icon: ReceiptText },
    { name: "Debts & Loans", href: "/debts", icon: Landmark },
    { name: "Evaluation", href: "/evaluation", icon: TrendingUp },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLogout = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      logoutAction();
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transform-gpu [transform:translateZ(0)] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left Side: Brand Logo, Project Switcher & Invite/Share button */}
        <div className="flex items-center gap-2">
          <ProjectSwitcher
            initialProjects={initialProjects}
            currentProject={currentProject}
          />
          {currentProject.role === "owner" && (
            <ManageMembersDialog
              projectId={currentProject.id}
              projectName={currentProject.name}
            >
              <Button
                variant="outline"
                size="sm"
                className="border-border bg-background text-primary hover:text-primary/80 hover:bg-muted/50 rounded-xl flex items-center gap-1.5 h-9"
                title="Share Project"
              >
                <Users className="size-4" />
                <span className="hidden sm:inline text-xs">Share</span>
              </Button>
            </ManageMembersDialog>
          )}
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent",
                )}
              >
                <Icon className="size-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Side: User Dropdown */}
        <div
          className="relative animate-in fade-in duration-300"
          ref={dropdownRef}
        >
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border hover:bg-muted/50 text-foreground text-sm font-semibold transition-all duration-200 cursor-pointer select-none"
            title="Profile menu"
          >
            <User className="size-4 text-muted-foreground" />
            <span className="max-w-[120px] truncate">{username}</span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-border bg-popover text-popover-foreground p-1.5 shadow-xl shadow-black/85 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
              <div className="px-3 py-2 border-b border-border/50 text-[10px] text-muted-foreground font-bold uppercase tracking-wider select-none">
                Signed in as{" "}
                <span className="text-foreground font-extrabold normal-case block mt-0.5">
                  {username}
                </span>
              </div>
              <form onSubmit={handleLogout} className="mt-1">
                <button
                  type="submit"
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-rose-400 hover:bg-rose-500/10 hover:text-rose-350 transition-all text-left cursor-pointer"
                >
                  <LogOut className="size-3.5" />
                  <span>Logout</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden border-t border-border bg-card px-2 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}

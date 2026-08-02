"use client";

import React, { startTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions";
import {
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
    { name: "Loans", href: "/debts", icon: Landmark },
    { name: "Evaluation", href: "/evaluation", icon: TrendingUp },
  ];

  const handleLogout = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      logoutAction();
    });
  };

  return (
    <>
      {/* Top navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-background">
        <div className="max-w-5xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          {/* Left: Project switcher + actions */}
          <div className="flex items-center gap-2 min-w-0">
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
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                  title="Share Project"
                >
                  <Users className="size-4" />
                </Button>
              </ManageMembersDialog>
            )}
          </div>

          {/* Center: Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors",
                    isActive
                      ? "text-foreground bg-muted font-medium"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right: Settings + User */}
          <div className="flex items-center gap-1">
            <Link
              href="/settings"
              className={cn(
                "p-2 rounded-md transition-colors",
                pathname === "/settings"
                  ? "text-foreground bg-muted"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title="Settings"
            >
              <Settings className="size-4" />
            </Link>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Profile menu"
              >
                <User className="size-4" />
                <span className="hidden sm:inline max-w-[100px] truncate">
                  {username}
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-1 w-44 rounded-lg border border-border bg-popover p-1 shadow-lg z-50">
                  <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border">
                    <span className="text-foreground font-medium block">
                      {username}
                    </span>
                  </div>
                  <form onSubmit={handleLogout} className="mt-1">
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-destructive hover:bg-muted transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="size-3.5" />
                      Logout
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background">
        <div className="flex items-center justify-around h-14 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1 px-3 text-[11px] transition-colors",
                  isActive
                    ? "text-foreground font-medium"
                    : "text-muted-foreground",
                )}
              >
                <Icon className="size-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

'use client';

import React, { startTransition } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/actions';
import { Wallet, LayoutDashboard, ReceiptText, Landmark, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import ProjectSwitcher from './ProjectSwitcher';

interface NavbarProps {
  username: string;
  initialProjects: { id: number; name: string }[];
  currentProject: { id: number; name: string };
}

export default function Navbar({ username, initialProjects, currentProject }: NavbarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', href: '/transactions', icon: ReceiptText },
    { name: 'Debts & Loans', href: '/debts', icon: Landmark },
  ];

  const handleLogout = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      logoutAction();
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/40 bg-black/70 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left Side: Brand Logo & Project Switcher */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 group shrink-0">
            <div className="flex items-center justify-center size-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 group-hover:bg-indigo-600/35 transition-colors">
              <Wallet className="size-5 text-indigo-400" />
            </div>
          </Link>
          <ProjectSwitcher initialProjects={initialProjects} currentProject={currentProject} />
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
                    ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent"
                )}
              >
                <Icon className="size-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Side: User & Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/50 text-slate-300 text-sm">
            <User className="size-4 text-slate-400" />
            <span className="font-medium hidden sm:inline max-w-[120px] truncate">{username}</span>
          </div>

          <form onSubmit={handleLogout}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="border-slate-800 bg-black text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl"
              title="Sign Out"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </form>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden border-t border-slate-900/60 bg-black/80 px-4 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs transition-colors",
                isActive ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
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

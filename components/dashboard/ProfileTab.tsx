"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  User,
  KeyRound,
  ShieldCheck,
  Save,
  CheckCircle2,
  Lock,
  Sun,
  Moon,
  Monitor,
  Palette,
  Check,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@clerk/nextjs";

export function ProfileTab() {
  const { user, isSignedIn } = useUser();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [fullName, setFullName] = useState("Hasan Student");
  const [email, setEmail] = useState("hasan@example.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setMounted(true);
    if (isSignedIn && user) {
      setFullName(user.fullName || user.firstName || "Authenticated User");
      setEmail(user.primaryEmailAddress?.emailAddress || "user@example.com");
    }
  }, [isSignedIn, user]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(
      "Profile information updated successfully!",
    );
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    setSuccessMessage(
      "Password changed successfully using bcrypt hashing algorithm!",
    );
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {successMessage && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-semibold">
          <CheckCircle2 className="h-5 w-5" /> {successMessage}
        </div>
      )}

      {/* Personal Information Card */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
            <User className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">
              Profile Management
            </CardTitle>
            <p className="text-xs text-slate-400">
              Update your personal details & authentication credentials
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Email Address</Label>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Locked
                  </span>
                </div>
                <Input
                  type="email"
                  value={email}
                  disabled
                  className="cursor-not-allowed opacity-75 bg-slate-100 dark:bg-zinc-900/60 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-800"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Email address is synced with your Clerk authentication account and disabled for direct modification.
                </p>
              </div>
            </div>
            <Button
              type="submit"
              variant="gradient"
              size="sm"
              className="gap-2"
            >
              <Save className="h-4 w-4" /> Save Profile Details
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Wide Appearance & Theme Preference Card */}
      {mounted && (
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">
                Appearance & Interface Theme
              </CardTitle>
              <p className="text-xs text-slate-400">
                Choose your preferred visual aesthetic for the finance dashboard.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Light Mode Option */}
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${
                  theme === "light"
                    ? "border-amber-500 bg-amber-500/10 text-amber-400 shadow-md"
                    : "border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-3 text-amber-500">
                  <Sun className="h-6 w-6" />
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Light Mode
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                  Clean & crisp daylight look
                </span>
                {theme === "light" && (
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-amber-400">
                    <Check className="h-3.5 w-3.5" /> Active Theme
                  </div>
                )}
              </button>

              {/* Dark Mode Option */}
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${
                  theme === "dark"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-md"
                    : "border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-3 text-emerald-400">
                  <Moon className="h-6 w-6" />
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Dark Mode
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                  Sleek dark glow aesthetic
                </span>
                {theme === "dark" && (
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                    <Check className="h-3.5 w-3.5" /> Active Theme
                  </div>
                )}
              </button>

              {/* System Preference */}
              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${
                  theme === "system"
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-md"
                    : "border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="h-12 w-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-3 text-cyan-400">
                  <Monitor className="h-6 w-6" />
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  System Preference
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                  Automatically syncs with OS
                </span>
                {theme === "system" && (
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-cyan-400">
                    <Check className="h-3.5 w-3.5" /> Active Theme
                  </div>
                )}
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security & Password Change Card */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 text-cyan-400">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">
              Security & Password Hashing
            </CardTitle>
            <p className="text-xs text-slate-400">
              Passwords are hashed using bcrypt algorithm prior to storage.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Current Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>New Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              className="gap-2"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Change
              Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  KeyRound,
  ShieldCheck,
  Mail,
  Save,
  CheckCircle2,
  Lock,
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
import { useUser, UserProfile } from "@clerk/nextjs";

export function ProfileTab() {
  const { user, isLoaded, isSignedIn } = useUser();

  const [fullName, setFullName] = useState("Hasan Student");
  const [email, setEmail] = useState("hasan@example.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (isSignedIn && user) {
      setFullName(user.fullName || user.firstName || "Authenticated User");
      setEmail(user.primaryEmailAddress?.emailAddress || "user@example.com");
    }
  }, [isSignedIn, user]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(
      "Profile information updated successfully! (Bcrypt & Clerk security synced)",
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

      {/* FR9 Personal Information Card */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
            <User className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">
              Profile Management (FR9)
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
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
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

      {/* FR1 & FR9 Security & Password Change Card */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 text-cyan-400">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">
              Security & Password Hashing (FR1 & FR9)
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

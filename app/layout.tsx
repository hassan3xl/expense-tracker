import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import Navbar from "@/components/layout/Navbar";
import { getCurrentProject, getSessionUser } from "@/lib/auth";
import sql from "@/lib/db";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pennywise | Finance Tracker",
  description: "Take control of your money",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();
  if (!user) return null;
  const currentProj = await getCurrentProject(user.userId);
  const projectsData = await sql`
      SELECT DISTINCT p.id, p.name FROM projects p
      LEFT JOIN project_members pm ON pm.project_id = p.id
      WHERE p.user_id = ${user.userId} OR pm.user_id = ${user.userId}
      ORDER BY p.name ASC
    `;
  const projects = (projectsData || []).map((p) => ({
    id: Number(p.id),
    name: String(p.name),
  }));
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        "dark",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <body className="min-h-full bg-black text-slate-100 flex flex-col font-sans">
        <Navbar
          username={user.username}
          initialProjects={projects}
          currentProject={currentProj}
        />
        <div className="flex-1 container mx-auto px-4 sm:px-6 py-8 space-y-8 max-w-7xl">
          {children}
        </div>
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "#0f172a",
              border: "1px solid #1e293b",
              color: "#f8fafc",
            },
          }}
        />
      </body>
    </html>
  );
}

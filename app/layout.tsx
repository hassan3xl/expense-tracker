import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Noto_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import Navbar from "@/components/layout/Navbar";
import { getCurrentProject, getSessionUser } from "@/lib/auth";
import sql from "@/lib/db";

const notoSansHeading = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
});

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0f14",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  let currentProj = null;
  let projects: { id: number; name: string }[] = [];

  if (user) {
    currentProj = await getCurrentProject(user.userId);
    const projectsData = await sql`
      SELECT DISTINCT p.id, p.name FROM projects p
      LEFT JOIN project_members pm ON pm.project_id = p.id
      WHERE p.user_id = ${user.userId} OR pm.user_id = ${user.userId}
      ORDER BY p.name ASC
    `;
    projects = (projectsData || []).map((p) => ({
      id: Number(p.id),
      name: String(p.name),
    }));
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        "dark",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
        notoSansHeading.variable,
      )}
    >
      <body className="min-h-screen overflow-x-hidden bg-background text-foreground font-sans">
        <div className="min-h-screen flex flex-col">
          {user && currentProj && (
            <Navbar
              username={user.username}
              initialProjects={projects}
              currentProject={currentProj}
            />
          )}

          <main className="flex-1 pt-16 pb-16 md:pb-0 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto py-6 space-y-6">
              {children}
            </div>
          </main>
        </div>
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--card-foreground)",
            },
          }}
        />
      </body>
    </html>
  );
}

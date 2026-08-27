import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finance Tracker - Expense Monitoring & Budget Management System",
  description: "Web-based finance tracker for recording income/expenses, monthly budget planning, automatic alert monitoring (Uma & Bhuvana 2026), category management, and CSV financial reporting.",
};

const isClerkKeyValid =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_live_") ||
    (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_test_") &&
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.length > 30));

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased">
        {isClerkKeyValid ? (
          <ClerkProvider>{children}</ClerkProvider>
        ) : (
          <div>{children}</div>
        )}
      </body>
    </html>
  );
}

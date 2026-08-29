import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { PWAProvider } from "@/components/pwa/PWAProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Pennywise - Personal Finance Tracker",
  description: "Web-based finance tracker for recording income/expenses, monthly budget planning, automatic alert monitoring, category management, and CSV financial reporting.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pennywise",
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: "/icons/icon.svg",
  },
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
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-screen flex flex-col antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <PWAProvider>
            {isClerkKeyValid ? (
              <ClerkProvider>{children}</ClerkProvider>
            ) : (
              <div>{children}</div>
            )}
            <Toaster />
          </PWAProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  
  // Public routes that bypass auth protection
  const isPublicRoute =
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/api/webhooks");

  if (!isPublicRoute) {
    // If clerk publishable key is not set or placeholder in dev, allow passage so demo mode works seamlessly
    const isClerkConfigured =
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("placeholder") &&
      !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("sample");

    if (isClerkConfigured) {
      await auth.protect();
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|webmanifest|fontawesome|svg|png|jpg|jpeg|gif|webp|ttf|woff2?|ico|csv|docx?|xlsx?|zip|musl)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

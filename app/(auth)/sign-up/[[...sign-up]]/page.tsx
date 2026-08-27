import { SignUp } from "@clerk/nextjs";
import { TrendingUp } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-3 mb-6 group">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
          <TrendingUp className="h-6 w-6 stroke-[2.5]" />
        </div>
        <span className="text-2xl font-black tracking-tight text-white">
          Finance<span className="text-emerald-400">Tracker</span>
        </span>
      </Link>

      {/* Clerk Sign Up Box */}
      <div className="w-full max-w-md flex justify-center">
        <SignUp
          appearance={{
            elements: {
              card: "bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl rounded-2xl",
              headerTitle: "text-white text-xl font-bold",
              headerSubtitle: "text-slate-400 text-sm",
              socialButtonsBlockButton:
                "bg-slate-950 border border-slate-800 text-slate-200 hover:bg-slate-800",
              formButtonPrimary:
                "bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold hover:opacity-90 transition-opacity",
              formFieldLabel: "text-slate-300 text-xs font-semibold",
              formFieldInput:
                "bg-slate-950 border border-slate-800 text-white focus:border-emerald-500/50 rounded-xl",
              footerActionLink: "text-emerald-400 font-semibold hover:underline",
            },
          }}
        />
      </div>
    </div>
  );
}

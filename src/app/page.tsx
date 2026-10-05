import Link from "next/link";
import { getSession } from "@/lib/auth";
import { CheckCircle2, ArrowRight, Shield, Layers, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between selection:bg-slate-900 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-30">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <span className="font-bold text-xs">T</span>
            </div>
            <span className="font-semibold text-sm tracking-tight text-slate-900">
              Tuyul Tracker
            </span>
          </div>

          <nav className="flex items-center gap-4">
            <Link
              href="/pricing"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Pricing
            </Link>

            {session ? (
              <Button asChild size="sm" className="h-8 text-xs font-medium">
                <Link href="/dashboard">
                  Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm" className="h-8 text-xs">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild size="sm" className="h-8 text-xs font-medium">
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center py-20 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-[11px] font-medium text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            SaaS Edition
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Keep every account on track.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto font-normal leading-relaxed">
            Track daily activities, progress, and multiple accounts from one simple workspace.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            {session ? (
              <Button asChild size="lg" className="h-11 px-6 text-sm font-medium">
                <Link href="/dashboard">
                  Open Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="h-11 px-6 text-sm font-medium w-full sm:w-auto">
                  <Link href="/register">Get Started Free</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-11 px-6 text-sm font-medium w-full sm:w-auto border-slate-200 text-slate-700"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* 3 Core Benefits */}
        <div className="max-w-5xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-slate-200/80 bg-white space-y-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Daily Tracking</h3>
            <p className="text-xs leading-relaxed text-slate-500">
              Matrix checklist with instant optimistic updates and real-time completion metrics across all your accounts.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200/80 bg-white space-y-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Multiple Accounts</h3>
            <p className="text-xs leading-relaxed text-slate-500">
              Organize accounts cleanly by groups, servers, jobs, and levels without clutter or spreadsheet confusion.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200/80 bg-white space-y-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Weekly Progress</h3>
            <p className="text-xs leading-relaxed text-slate-500">
              7-day visual history to audit completion consistency, streak records, and identify accounts needing attention.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 px-6 bg-slate-50/50">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Tuyul Tracker. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="hover:text-slate-900 transition-colors">
              Pricing
            </Link>
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

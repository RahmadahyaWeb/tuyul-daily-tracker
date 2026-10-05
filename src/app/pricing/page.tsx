import Link from "next/link";
import { getSession } from "@/lib/auth";
import { PLANS } from "@/lib/plans";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing plans for Tuyul Tracker",
};

export default async function PricingPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>

          {session ? (
            <Button asChild size="sm" className="h-8 text-xs">
              <Link href="/dashboard">Open Dashboard</Link>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="h-8 text-xs">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="h-8 text-xs">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-16 px-6 max-w-4xl mx-auto w-full">
        <div className="text-center space-y-3 mb-12">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Simple, transparent pricing
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Choose the plan that fits your tracking needs. Upgrade or cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* FREE Plan */}
          <div className="p-8 rounded-xl border border-slate-200 bg-white flex flex-col justify-between space-y-6 shadow-2xs">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{PLANS.FREE.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{PLANS.FREE.description}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900">{PLANS.FREE.price}</span>
                <span className="text-xs text-slate-500">/ {PLANS.FREE.billingPeriod}</span>
              </div>

              <ul className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
                {PLANS.FREE.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button asChild variant="outline" className="w-full text-xs font-medium border-slate-200">
              <Link href={session ? "/dashboard" : "/register"}>
                {session ? "Current Plan" : "Get Started Free"}
              </Link>
            </Button>
          </div>

          {/* PRO Plan */}
          <div className="p-8 rounded-xl border-2 border-slate-900 bg-slate-50/50 flex flex-col justify-between space-y-6 relative shadow-md">
            <div className="absolute -top-3 right-6 bg-slate-900 text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              Recommended
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{PLANS.PRO.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{PLANS.PRO.description}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900">{PLANS.PRO.price}</span>
                <span className="text-xs text-slate-500">/ {PLANS.PRO.billingPeriod}</span>
              </div>

              <ul className="space-y-2.5 pt-4 border-t border-slate-200/80 text-xs text-slate-700">
                {PLANS.PRO.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button asChild className="w-full text-xs font-medium bg-slate-900 text-white hover:bg-slate-800">
              <Link href={session ? "/settings/billing" : "/register"}>
                Upgrade to Pro <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6 px-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Tuyul Tracker. All rights reserved.
      </footer>
    </div>
  );
}

import Link from "next/link";
import { getSession } from "@/lib/auth";
import { PLANS } from "@/lib/plans";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import { Logo } from "@/components/brand/Logo";

export const metadata: Metadata = {
  title: "Pricing — Dituyulin",
  description: "Simple, transparent pricing plans for Dituyulin",
};

export default async function PricingPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2c261e] flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-[#dfd5c5] bg-[#FCFAF7]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Logo size="sm" />
          </Link>

          {session ? (
            <Button asChild size="sm" className="h-8 text-xs">
              <Link href="/dashboard">Open Dashboard</Link>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-[#5c4e3b] hover:bg-[#F3ECE0]">
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs bg-[#FAF2E1] border border-[#cfbeaa] text-[11px] font-bold text-[#664b28] font-pixel uppercase shadow-[1px_1px_0px_#baa892]">
            GUILD MEMBERSHIP TIERS
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#231b12]">
            Simple, transparent pricing
          </h1>
          <p className="text-sm text-[#736350] max-w-md mx-auto">
            Choose the plan that fits your tracking needs. Upgrade or cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* FREE Plan */}
          <div className="p-8 rounded-xs border-2 border-[#cfbeaa] bg-white flex flex-col justify-between space-y-6 shadow-[3px_3px_0px_#baa892]">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[#231b12] font-pixel tracking-wider uppercase">{PLANS.FREE.name}</h3>
                <p className="text-xs text-[#736350] mt-1">{PLANS.FREE.description}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-[#231b12] font-mono">{PLANS.FREE.price}</span>
                <span className="text-xs text-[#736350]">/ {PLANS.FREE.billingPeriod}</span>
              </div>

              <ul className="space-y-2.5 pt-4 border-t border-[#eee7dc] text-xs text-[#5c4e3b]">
                {PLANS.FREE.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#1E5D2F] shrink-0 stroke-[2.5]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button asChild variant="outline" className="w-full text-xs font-medium">
              <Link href={session ? "/dashboard" : "/register"}>
                {session ? "Current Plan" : "Get Started Free"}
              </Link>
            </Button>
          </div>

          {/* PRO Plan */}
          <div className="p-8 rounded-xs border-2 border-[#3B6EA8] bg-[#F2F7FC] flex flex-col justify-between space-y-6 relative shadow-[4px_4px_0px_#2a5082]">
            <div className="absolute -top-3 right-6 bg-[#3B6EA8] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-none font-pixel shadow-[1px_1px_0px_#1e3b60]">
              Recommended
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[#231b12] font-pixel tracking-wider uppercase">{PLANS.PRO.name}</h3>
                <p className="text-xs text-[#736350] mt-1">{PLANS.PRO.description}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-[#231b12] font-mono">{PLANS.PRO.price}</span>
                <span className="text-xs text-[#736350]">/ {PLANS.PRO.billingPeriod}</span>
              </div>

              <ul className="space-y-2.5 pt-4 border-t border-[#cfc3b0] text-xs text-[#2c261e]">
                {PLANS.PRO.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#1E5D2F] shrink-0 stroke-[2.5]" />
                    <span className="font-semibold">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button asChild className="w-full text-xs font-medium">
              <Link href={session ? "/settings/billing" : "/register"}>
                Upgrade to Pro <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#dfd5c5] py-6 px-6 text-center text-xs text-[#8a7b68] bg-[#F4EFE6]/50">
        © {new Date().getFullYear()} Dituyulin. All rights reserved.
      </footer>
    </div>
  );
}

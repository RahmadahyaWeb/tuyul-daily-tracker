import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import { Logo } from "@/components/brand/Logo";

export const metadata: Metadata = {
  title: "Terms of Service — Dituyulin",
  description: "Terms of Service for Dituyulin",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2c261e] flex flex-col justify-between">
      <header className="border-b border-[#dfd5c5] bg-[#FCFAF7]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xs font-medium text-[#736350] hover:text-[#231b12] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <Logo size="sm" />
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto py-12 px-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#231b12]">Terms of Service</h1>
          <p className="text-xs text-[#8a7b68] mt-1 font-mono">Last updated: October 2026</p>
        </div>

        <section className="space-y-3 text-xs leading-relaxed text-[#5c4e3b]">
          <h2 className="text-sm font-semibold text-[#231b12]">1. ACCEPTANCE OF TERMS</h2>
          <p>
            By accessing or using Dituyulin, you agree to be bound by these Terms of Service. If you do not agree, please do not use the application.
          </p>

          <h2 className="text-sm font-semibold text-[#231b12] pt-3">2. USER ACCOUNTS & RESPONSIBILITIES</h2>
          <p>
            You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.
          </p>

          <h2 className="text-sm font-semibold text-[#231b12] pt-3">3. USAGE LIMITS & PLANS</h2>
          <p>
            Free tier accounts are limited to 5 managed accounts. Upgrading to Pro unlocks additional quota and priority capabilities in accordance with our pricing schedule.
          </p>

          <h2 className="text-sm font-semibold text-[#231b12] pt-3">4. LIMITATION OF LIABILITY</h2>
          <p>
            Dituyulin is provided &quot;as is&quot; without warranty of any kind. We are not liable for any indirect or consequential damages arising from your use of the service.
          </p>
        </section>
      </main>

      <footer className="border-t border-[#dfd5c5] py-6 text-center text-xs text-[#8a7b68] bg-[#F4EFE6]/50">
        © {new Date().getFullYear()} Dituyulin. All rights reserved.
      </footer>
    </div>
  );
}

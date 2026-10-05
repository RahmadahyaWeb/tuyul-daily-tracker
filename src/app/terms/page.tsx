import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Tuyul Tracker",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <header className="border-b border-slate-100 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <span className="text-xs font-bold tracking-tight text-slate-900">Tuyul Tracker</span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto py-12 px-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Terms of Service</h1>
          <p className="text-xs text-slate-400 mt-1">Last updated: October 2026</p>
        </div>

        <section className="space-y-3 text-xs leading-relaxed text-slate-600">
          <h2 className="text-sm font-semibold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Tuyul Tracker, you agree to be bound by these Terms of Service. If you do not agree, please do not use the application.
          </p>

          <h2 className="text-sm font-semibold text-slate-900 pt-3">2. User Accounts & Responsibilities</h2>
          <p>
            You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.
          </p>

          <h2 className="text-sm font-semibold text-slate-900 pt-3">3. Usage Limits & Plans</h2>
          <p>
            Free tier accounts are limited to 5 managed game accounts. Upgrading to Pro unlocks additional quota and priority capabilities in accordance with our pricing schedule.
          </p>

          <h2 className="text-sm font-semibold text-slate-900 pt-3">4. Limitation of Liability</h2>
          <p>
            Tuyul Tracker is provided "as is" without warranty of any kind. We are not liable for any indirect or consequential damages arising from your use of the service.
          </p>
        </section>
      </main>

      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Tuyul Tracker. All rights reserved.
      </footer>
    </div>
  );
}

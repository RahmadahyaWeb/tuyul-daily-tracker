import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Tuyul Tracker",
};

export default function PrivacyPage() {
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Privacy Policy</h1>
          <p className="text-xs text-slate-400 mt-1">Last updated: October 2026</p>
        </div>

        <section className="space-y-3 text-xs leading-relaxed text-slate-600">
          <h2 className="text-sm font-semibold text-slate-900">1. Data We Collect</h2>
          <p>
            We collect minimal account information necessary to provide the tracking service, such as your username, hashed password, and game account metadata (nicknames, servers, jobs).
          </p>

          <h2 className="text-sm font-semibold text-slate-900 pt-3">2. Credential Security & Encryption</h2>
          <p>
            Game account passwords stored in Tuyul Tracker are encrypted using AES-256-GCM encryption with keys stored securely in server environment variables. We never store plain text passwords in our database.
          </p>

          <h2 className="text-sm font-semibold text-slate-900 pt-3">3. Data Isolation</h2>
          <p>
            All user data is strictly scoped to your tenant workspace. We do not sell or share your personal data with any third parties.
          </p>

          <h2 className="text-sm font-semibold text-slate-900 pt-3">4. Cookies & Authentication</h2>
          <p>
            We use secure, HttpOnly session cookies solely for authentication and session management.
          </p>
        </section>
      </main>

      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Tuyul Tracker. All rights reserved.
      </footer>
    </div>
  );
}

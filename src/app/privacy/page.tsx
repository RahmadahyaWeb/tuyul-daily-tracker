import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import { Logo } from "@/components/brand/Logo";

export const metadata: Metadata = {
  title: "Privacy Policy — Dituyulin",
  description: "Privacy Policy for Dituyulin",
};

export default function PrivacyPage() {
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
          <h1 className="text-2xl font-bold tracking-tight text-[#231b12]">Privacy Policy</h1>
          <p className="text-xs text-[#8a7b68] mt-1 font-mono">Last updated: October 2026</p>
        </div>

        <section className="space-y-3 text-xs leading-relaxed text-[#5c4e3b]">
          <h2 className="text-sm font-bold text-[#231b12] font-pixel tracking-wide">1. DATA WE COLLECT</h2>
          <p>
            We collect minimal account information necessary to provide the tracking service, such as your username, hashed password, and game account metadata (nicknames, servers, jobs).
          </p>

          <h2 className="text-sm font-bold text-[#231b12] font-pixel tracking-wide pt-3">2. CREDENTIAL SECURITY & ENCRYPTION</h2>
          <p>
            Account metadata stored in Dituyulin is safeguarded with strict access controls. We never store plain text passwords in our database.
          </p>

          <h2 className="text-sm font-bold text-[#231b12] font-pixel tracking-wide pt-3">3. DATA ISOLATION</h2>
          <p>
            All user data is strictly scoped to your tenant workspace. We do not sell or share your personal data with any third parties.
          </p>

          <h2 className="text-sm font-bold text-[#231b12] font-pixel tracking-wide pt-3">4. COOKIES & AUTHENTICATION</h2>
          <p>
            We use secure, HttpOnly session cookies solely for authentication and session management.
          </p>
        </section>
      </main>

      <footer className="border-t border-[#dfd5c5] py-6 text-center text-xs text-[#8a7b68] bg-[#F4EFE6]/50">
        © {new Date().getFullYear()} Dituyulin. All rights reserved.
      </footer>
    </div>
  );
}

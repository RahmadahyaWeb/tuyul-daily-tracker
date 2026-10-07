import Link from "next/link";
import { getSession } from "@/lib/auth";
import { CheckCircle2, ArrowRight, Shield, Layers, Calendar, Sparkles, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2c261e] flex flex-col justify-between selection:bg-[#3B6EA8] selection:text-white relative">
      {/* Subtle retro pixel top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#3B6EA8] via-[#4375b4] to-[#2F5B8D]" />

      {/* Header */}
      <header className="border-b border-[#dfd5c5] sticky top-0 bg-[#FAF8F5]/90 backdrop-blur-md z-30">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Logo size="md" />
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              href="/pricing"
              className="text-xs font-medium text-[#685744] hover:text-[#231b12] transition-colors"
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
                <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-[#5c4e3b] hover:bg-[#F3ECE0]">
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
      <main className="flex-1 flex flex-col justify-center py-16 sm:py-20 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-[#FAF2E1] border border-[#cfbeaa] text-[11px] font-semibold text-[#664b28] shadow-[1px_1px_0px_#dfd0bb]">
            <span className="w-2 h-2 bg-[#4375b4] rounded-none inline-block shadow-[0.5px_0.5px_0px_#1e3b60]" />
            <span className="font-pixel tracking-wider uppercase">MMORPG-INSPIRED WORKSPACE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#231b12] leading-[1.15]">
            Track every account, <br className="hidden sm:inline" />
            <span className="text-[#3B6EA8] underline decoration-wavy decoration-[#cfbeaa] decoration-2 underline-offset-8">
              the pixel way.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#5e503f] max-w-xl mx-auto font-normal leading-relaxed">
            Track daily progress, manage multiple accounts, and keep everything organized in one fantasy-inspired workspace.
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {session ? (
              <Button asChild size="lg" className="h-11 px-7 text-sm font-medium">
                <Link href="/dashboard">
                  Open Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="h-11 px-7 text-sm font-medium w-full sm:w-auto">
                  <Link href="/register">Get Started</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-11 px-7 text-sm font-medium w-full sm:w-auto"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Product Preview Section (Tavern Quest Board / RPG UI Window Frame) */}
        <div className="max-w-4xl mx-auto mt-14 sm:mt-16 w-full">
          <div className="rounded-xs border border-[#cfbeaa] bg-[#FCFAF7] p-2 sm:p-3 shadow-[2px_2px_0px_#ded5c5]">
            {/* Window title bar */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#dfd5c5] bg-[#F4EFE6] rounded-xs mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-[#A82A1E] rounded-none border border-[#78180e]" />
                <div className="w-2.5 h-2.5 bg-[#B57C1E] rounded-none border border-[#785112]" />
                <div className="w-2.5 h-2.5 bg-[#347A46] rounded-none border border-[#1b4b27]" />
                <span className="text-[11px] font-bold text-[#5c4a35] tracking-wider uppercase ml-1">
                  Daily Quest Tracker — Notice Board
                </span>
              </div>
              <span className="text-[10px] text-[#8c7456] font-mono">SERVER: PRONTERA-01</span>
            </div>

            {/* Simulated Clean SaaS RPG Table */}
            <div className="border border-[#ded4c4] rounded-xs overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <div className="min-w-[520px]">
                  <div className="grid grid-cols-12 bg-[#F4EFE6] border-b border-[#ded4c4] px-3 py-2 text-[11px] font-bold text-[#5a4c3a]">
                    <div className="col-span-4 sm:col-span-3">ACCOUNT / CLASS</div>
                    <div className="col-span-3 sm:col-span-2 text-center">DAILY EXP</div>
                    <div className="col-span-2 text-center">DUNGEON</div>
                    <div className="col-span-2 text-center">BOSS HUNT</div>
                    <div className="col-span-1 sm:col-span-3 text-right">PROGRESS</div>
                  </div>

              {/* Row 1 */}
              <div className="grid grid-cols-12 items-center px-3 py-2.5 border-b border-[#eee7dc] hover:bg-[#FAF6F0] text-xs">
                <div className="col-span-4 sm:col-span-3 font-medium text-[#2c261e] flex items-center gap-2">
                  <div className="w-5 h-5 rounded-none bg-[#FAF2E1] border border-[#d2c0aa] flex items-center justify-center text-[10px] font-mono font-bold text-[#664b28]">
                    99
                  </div>
                  <div>
                    <p className="font-semibold text-xs leading-none">LordKnight_01</p>
                    <p className="text-[10px] text-[#8a7b68] mt-0.5">Knight Guild</p>
                  </div>
                </div>
                <div className="col-span-3 sm:col-span-2 flex justify-center">
                  <div className="w-4 h-4 rounded-none border border-[#347A46] bg-[#347A46] text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
                <div className="col-span-2 flex justify-center">
                  <div className="w-4 h-4 rounded-none border border-[#347A46] bg-[#347A46] text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
                <div className="col-span-2 flex justify-center">
                  <div className="w-4 h-4 rounded-none border border-[#347A46] bg-[#347A46] text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
                <div className="col-span-1 sm:col-span-3 flex items-center justify-end gap-2">
                  <div className="hidden sm:block w-20 h-2 bg-[#f0eae1] rounded-none border border-[#cfc3b0] overflow-hidden">
                    <div className="h-full bg-[#347A46] w-full" />
                  </div>
                  <span className="text-[11px] font-bold text-[#1E5D2F] font-mono">100%</span>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-12 items-center px-3 py-2.5 border-b border-[#eee7dc] hover:bg-[#FAF6F0] text-xs">
                <div className="col-span-4 sm:col-span-3 font-medium text-[#2c261e] flex items-center gap-2">
                  <div className="w-5 h-5 rounded-none bg-[#F2F7FC] border border-[#aec3db] flex items-center justify-center text-[10px] font-mono font-bold text-[#204E85]">
                    85
                  </div>
                  <div>
                    <p className="font-semibold text-xs leading-none">HighPriest_Buff</p>
                    <p className="text-[10px] text-[#8a7b68] mt-0.5">Support Team</p>
                  </div>
                </div>
                <div className="col-span-3 sm:col-span-2 flex justify-center">
                  <div className="w-4 h-4 rounded-none border border-[#347A46] bg-[#347A46] text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
                <div className="col-span-2 flex justify-center">
                  <div className="w-4 h-4 rounded-none border border-[#347A46] bg-[#347A46] text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
                <div className="col-span-2 flex justify-center">
                  <div className="w-4 h-4 rounded-none border border-[#cfc3b0] bg-white" />
                </div>
                <div className="col-span-1 sm:col-span-3 flex items-center justify-end gap-2">
                  <div className="hidden sm:block w-20 h-2 bg-[#f0eae1] rounded-none border border-[#cfc3b0] overflow-hidden">
                    <div className="h-full bg-[#3B6EA8] w-2/3" />
                  </div>
                  <span className="text-[11px] font-bold text-[#3B6EA8] font-mono">67%</span>
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-12 items-center px-3 py-2.5 hover:bg-[#FAF6F0] text-xs">
                <div className="col-span-4 sm:col-span-3 font-medium text-[#2c261e] flex items-center gap-2">
                  <div className="w-5 h-5 rounded-none bg-[#FDF4F3] border border-[#e5b8b4] flex items-center justify-center text-[10px] font-mono font-bold text-[#A82A1E]">
                    72
                  </div>
                  <div>
                    <p className="font-semibold text-xs leading-none">Sniper_Main</p>
                    <p className="text-[10px] text-[#8a7b68] mt-0.5">Archer Unit</p>
                  </div>
                </div>
                <div className="col-span-3 sm:col-span-2 flex justify-center">
                  <div className="w-4 h-4 rounded-none border border-[#347A46] bg-[#347A46] text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
                <div className="col-span-2 flex justify-center">
                  <div className="w-4 h-4 rounded-none border border-[#cfc3b0] bg-white" />
                </div>
                <div className="col-span-2 flex justify-center">
                  <div className="w-4 h-4 rounded-none border border-[#cfc3b0] bg-white" />
                </div>
                <div className="col-span-1 sm:col-span-3 flex items-center justify-end gap-2">
                  <div className="hidden sm:block w-20 h-2 bg-[#f0eae1] rounded-none border border-[#cfc3b0] overflow-hidden">
                    <div className="h-full bg-[#B57C1E] w-1/3" />
                  </div>
                  <span className="text-[11px] font-bold text-[#8C580B] font-mono">33%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

        {/* 3 Core Benefits */}
        <div className="max-w-4xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-xs border border-[#ded5c5] bg-white shadow-[2px_2px_0px_#e2d9cd] space-y-2.5">
            <div className="w-8 h-8 rounded-none bg-[#FAF2E1] border border-[#cfbeaa] flex items-center justify-center text-[#5A4122]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-[#231b12]">
              Daily Activities Checklist
            </h3>
            <p className="text-xs leading-relaxed text-[#685744]">
              High-speed matrix checklist with instant optimistic updates and real-time completion gauge across all accounts.
            </p>
          </div>

          <div className="p-5 rounded-xs border border-[#ded5c5] bg-white shadow-[2px_2px_0px_#e2d9cd] space-y-2.5">
            <div className="w-8 h-8 rounded-none bg-[#F2F7FC] border border-[#aec3db] flex items-center justify-center text-[#204E85]">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-[#231b12]">
              Account Groups & Categories
            </h3>
            <p className="text-xs leading-relaxed text-[#685744]">
              Group accounts by server, job class, level brackets, and role without messy spreadsheet formulas.
            </p>
          </div>

          <div className="p-5 rounded-xs border border-[#ded5c5] bg-white shadow-[2px_2px_0px_#e2d9cd] space-y-2.5">
            <div className="w-8 h-8 rounded-none bg-[#ECFDF3] border border-[#a3ddb4] flex items-center justify-center text-[#1E5D2F]">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-[#231b12]">
              Weekly Progress Audit
            </h3>
            <p className="text-xs leading-relaxed text-[#685744]">
              7-day visual audit log to review completion consistency, streak records, and discover accounts falling behind.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-3xl mx-auto mt-20 w-full">
          <div className="rounded-xs border border-[#cfbeaa] bg-[#F7F2E9]/70 p-8 sm:p-10 text-center space-y-4 shadow-[2px_2px_0px_#ded5c5]">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#231b12]">
              Ready to start tracking?
            </h2>
            <p className="text-sm text-[#5e503f] max-w-md mx-auto">
              Get your workspace up and running in minutes. Experience fast, pixel-clean account management.
            </p>
            <div className="pt-2">
              <Button asChild size="lg" className="h-10 px-8 text-sm font-medium">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#dfd5c5] py-8 px-6 bg-[#F4EFE6]/50">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#736350]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#2c261e]">Dituyulin</span>
            <span>—</span>
            <span>Track every account, the pixel way.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="hover:text-[#231b12] transition-colors">
              Pricing
            </Link>
            <Link href="/privacy" className="hover:text-[#231b12] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[#231b12] transition-colors">
              Terms
            </Link>
            <Link href="/login" className="hover:text-[#231b12] transition-colors font-medium text-[#3B6EA8]">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

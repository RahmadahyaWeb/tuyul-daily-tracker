import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LogoIcon } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAF8F5] text-center space-y-4">
      <div className="rounded-xs border border-[#cfbeaa] bg-white p-8 shadow-[2px_2px_0px_#ded5c5] max-w-sm w-full space-y-4">
        <div className="w-12 h-12 rounded-none bg-[#FAF2E1] border border-[#cfbeaa] flex items-center justify-center mx-auto text-[#664b28] font-pixel text-base font-bold shadow-[1px_1px_0px_#baa892]">
          404
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-[#231b12]">
            Page Not Found
          </h1>
          <p className="text-xs text-[#736350] max-w-xs mx-auto">
            The page you are looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <div className="pt-2">
          <Button asChild size="default">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

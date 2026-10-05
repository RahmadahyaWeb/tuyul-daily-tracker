import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center space-y-4">
      <div className="w-12 h-12 rounded-xl bg-slate-200/80 flex items-center justify-center text-slate-700 font-bold text-sm">
        404
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Page not found
        </h1>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
      <div className="pt-2">
        <Button asChild size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-xs">
          <Link href="/dashboard">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}

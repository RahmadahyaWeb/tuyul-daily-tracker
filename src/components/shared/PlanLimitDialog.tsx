"use client";

import React from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

interface PlanLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxAccounts?: number;
  planName?: string;
}

export function PlanLimitDialog({
  open,
  onOpenChange,
  maxAccounts = 5,
  planName = "Free",
}: PlanLimitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-1">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <DialogTitle className="text-center text-lg font-bold text-slate-900">
            Account limit reached
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            You&apos;ve reached the {maxAccounts}-account limit on the {planName} plan. Upgrade to Pro to manage up to 100 accounts.
          </DialogDescription>
        </DialogHeader>

        <div className="pt-4 flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1 text-xs"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            asChild
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium"
          >
            <Link href="/settings/billing">
              Upgrade to Pro <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

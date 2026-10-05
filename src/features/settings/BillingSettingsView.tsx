"use client";

import React, { useState, useTransition } from "react";
import { Workspace } from "@/lib/workspace";
import { PLANS } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { requestPlanUpgrade } from "@/server/actions/billing";
import {
  Check,
  Sparkles,
  CreditCard,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface BillingSettingsViewProps {
  workspace: Workspace;
  initialBillingRequest?: {
    id: string;
    plan: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    notes: string | null;
    createdAt: string;
  } | null;
}

export function BillingSettingsView({
  workspace,
  initialBillingRequest,
}: BillingSettingsViewProps) {
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [billingRequest, setBillingRequest] = useState(initialBillingRequest);
  const [isPending, startTransition] = useTransition();

  const plan = workspace.plan;
  const isPro = plan.id === "PRO";
  const limit = plan.maxAccounts;
  const count = workspace.accountCount;
  const usagePercent = Math.min(100, Math.round((count / limit) * 100));

  const handleConfirmUpgrade = () => {
    startTransition(async () => {
      const res = await requestPlanUpgrade(notes);
      if (res.success) {
        setBillingRequest({
          id: "temp-id",
          plan: "PRO",
          status: "PENDING",
          notes,
          createdAt: new Date().toISOString(),
        });
        setUpgradeModalOpen(false);
        toast.success("Upgrade request submitted! Awaiting administrator approval.");
      } else {
        toast.error(res.error || "Failed to submit upgrade request");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Pending Approval Notice */}
      {!isPro && billingRequest?.status === "PENDING" && (
        <div className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/70 text-amber-900 shadow-2xs flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Upgrade Request Pending Approval
            </h4>
            <p className="text-xs text-amber-700 leading-relaxed">
              Your request to upgrade to the <strong>Pro Plan ($9/mo)</strong> has been submitted to the administrator. Once approved, your account limit will be automatically unlocked to 100 tuyul accounts.
            </p>
          </div>
        </div>
      )}

      {/* Current Plan Overview */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">{plan.name} Plan</h2>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isPro
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                Current
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-2xl font-bold text-slate-900">{plan.price}</span>
            <span className="text-xs text-slate-500"> / {plan.billingPeriod}</span>
          </div>
        </div>

        {/* Usage Progress */}
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Account Usage</span>
            <span className="font-medium text-slate-900">
              {count} of {limit} accounts ({usagePercent}%)
            </span>
          </div>
          <Progress value={usagePercent} className="h-2" />
          {count >= limit && (
            <p className="text-[11px] text-amber-700 font-medium pt-1">
              You have reached the maximum account limit for the {plan.name} plan.
            </p>
          )}
        </div>

        {!isPro && (
          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Need to manage more characters? Upgrade to unlock 100 accounts.
            </span>
            <Button
              onClick={() => setUpgradeModalOpen(true)}
              disabled={billingRequest?.status === "PENDING"}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>
                {billingRequest?.status === "PENDING"
                  ? "Upgrade Pending..."
                  : "Upgrade to Pro"}
              </span>
            </Button>
          </div>
        )}
      </div>

      {/* Plan Features */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-400">
          Plan Capabilities
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600">
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Upgrade Modal */}
      <Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center mb-2">
              <Sparkles className="w-4 h-4 text-indigo-300" />
            </div>
            <DialogTitle className="text-lg font-bold">Upgrade to Pro Plan</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Unlock up to 100 accounts, priority cloud sync, and enhanced character monitoring.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 border-y border-slate-100 text-xs text-slate-700">
            <div className="flex justify-between items-baseline font-bold text-slate-900">
              <span>Pro Subscription</span>
              <span className="text-base text-indigo-600">{PLANS.PRO.price} / month</span>
            </div>

            <ul className="space-y-1.5 text-slate-600 text-[11px]">
              {PLANS.PRO.features.slice(0, 4).map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-semibold text-slate-700 block">
                Billing Notes / Payment Confirmation (Optional):
              </label>
              <Textarea
                placeholder="Include payment invoice ID, bank transfer reference, or message for administrator..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="text-xs bg-slate-50/50"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUpgradeModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmUpgrade}
              disabled={isPending}
              className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium"
            >
              Submit Upgrade Request <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

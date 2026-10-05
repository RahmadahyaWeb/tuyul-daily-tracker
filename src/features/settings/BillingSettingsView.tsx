"use client";

import React, { useState } from "react";
import { Workspace } from "@/lib/workspace";
import { PLANS } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, Sparkles, CreditCard, ArrowRight } from "lucide-react";
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
}

export function BillingSettingsView({ workspace }: BillingSettingsViewProps) {
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const plan = workspace.plan;
  const isPro = plan.id === "PRO";
  const limit = plan.maxAccounts;
  const count = workspace.accountCount;
  const usagePercent = Math.min(100, Math.round((count / limit) * 100));

  const handleSimulateUpgrade = () => {
    setIsUpgrading(true);
    setTimeout(() => {
      setIsUpgrading(false);
      setUpgradeModalOpen(false);
      toast.success("Upgrade request recorded! Contact admin to activate custom enterprise billing.");
    }, 800);
  };

  return (
    <div className="space-y-6">
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
          <div className="pt-2 flex justify-end">
            <Button
              onClick={() => setUpgradeModalOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Upgrade to Pro
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
              <Sparkles className="w-4 h-4" />
            </div>
            <DialogTitle className="text-lg font-bold">Upgrade to Pro</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Unlock up to 100 accounts, priority cloud sync, and enhanced Tuyul management.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3 border-y border-slate-100 text-xs text-slate-700">
            <div className="flex justify-between items-baseline font-bold text-slate-900">
              <span>Pro Plan</span>
              <span className="text-base">{PLANS.PRO.price} / mo</span>
            </div>
            <ul className="space-y-1.5 text-slate-600 text-[11px]">
              {PLANS.PRO.features.slice(0, 4).map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
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
              onClick={handleSimulateUpgrade}
              isLoading={isUpgrading}
              className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium"
            >
              Confirm Upgrade <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { completeOnboardingAction } from "@/server/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, ArrowLeft, Check, Layers, UserPlus, ListChecks } from "lucide-react";
import { toast } from "sonner";

interface ActivityOption {
  id: string;
  name: string;
  code: string;
}

interface OnboardingViewProps {
  username: string;
  activities: ActivityOption[];
}

export function OnboardingView({ username, activities }: OnboardingViewProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [workspaceName, setWorkspaceName] = useState(`${username}'s Workspace`);
  const [nickname, setNickname] = useState("");
  const [accountUsername, setAccountUsername] = useState("");
  const [server, setServer] = useState("Prontera-1");
  const [job, setJob] = useState("Assassin Cross");
  const [selectedActivities, setSelectedActivities] = useState<string[]>(
    activities.map((a) => a.id)
  );

  const toggleActivity = (id: string) => {
    setSelectedActivities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceName.trim()) {
      toast.error("Please enter a workspace name");
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !accountUsername.trim()) {
      toast.error("Please fill in character nickname and username");
      return;
    }
    setStep(3);
  };

  const handleSubmit = async () => {
    if (selectedActivities.length === 0) {
      toast.error("Please select at least one activity");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("workspaceName", workspaceName);
    formData.append("nickname", nickname);
    formData.append("username", accountUsername);
    formData.append("server", server);
    formData.append("job", job);
    formData.append("activityIds", JSON.stringify(selectedActivities));

    try {
      const res = await completeOnboardingAction(formData);
      if (res && res.success) {
        toast.success("Character created successfully! Welcome to Dituyulin.");
        router.push("/tracker");
        router.refresh();
      } else {
        toast.error(res?.error || "Failed to create account. Please try again.");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to complete setup");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4 selection:bg-[#3B6EA8] selection:text-white">
      <div className="w-full max-w-lg space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8a7b68]">
              Setup Workspace & First Character
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#8a7b68] font-medium font-mono">
            Step {step} of 3
          </div>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-2 px-2">
          <div
            className={`h-1.5 flex-1 rounded-xs transition-all ${
              step >= 1 ? "bg-[#3B6EA8]" : "bg-[#ded4c4]"
            }`}
          />
          <div
            className={`h-1.5 flex-1 rounded-xs transition-all ${
              step >= 2 ? "bg-[#3B6EA8]" : "bg-[#ded4c4]"
            }`}
          />
          <div
            className={`h-1.5 flex-1 rounded-xs transition-all ${
              step >= 3 ? "bg-[#3B6EA8]" : "bg-[#ded4c4]"
            }`}
          />
        </div>

        {/* Card Body */}
        <div className="bg-white border border-[#cfbeaa] rounded-xs p-6 sm:p-8 shadow-[2px_2px_0px_#ded5c5]">
          {/* STEP 1: Workspace Name */}
          {step === 1 && (
            <form onSubmit={handleNextStep1} className="space-y-5">
              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xs bg-[#FAF2E1] border border-[#cfbeaa] flex items-center justify-center text-[#5A4122] mb-2">
                  <Layers className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold tracking-tight text-[#231b12]">
                  Name your workspace
                </h2>
                <p className="text-xs text-[#736350]">
                  A workspace is where your character accounts, teams, and daily activities live.
                </p>
              </div>

              <div className="pt-2">
                <Input
                  label="Workspace Name"
                  id="workspaceName"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. My Farm Guild"
                  required
                  autoFocus
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" size="sm">
                  Continue <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </form>
          )}

          {/* STEP 2: First Account Info */}
          {step === 2 && (
            <form onSubmit={handleNextStep2} className="space-y-5">
              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xs bg-[#FAF2E1] border border-[#cfbeaa] flex items-center justify-center text-[#5A4122] mb-2">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold tracking-tight text-[#231b12]">
                  Add your first character account
                </h2>
                <p className="text-xs text-[#736350]">
                  Enter your character information to start your daily tracking list.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Character Nickname"
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="e.g. Rynzo"
                    required
                    autoFocus
                  />
                  <Input
                    label="Game Username / ID"
                    id="username"
                    value={accountUsername}
                    onChange={(e) => setAccountUsername(e.target.value)}
                    placeholder="e.g. rynzo_ro"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Server"
                    id="server"
                    value={server}
                    onChange={(e) => setServer(e.target.value)}
                    placeholder="e.g. Prontera-1"
                    required
                  />
                  <Input
                    label="Job / Class"
                    id="job"
                    value={job}
                    onChange={(e) => setJob(e.target.value)}
                    placeholder="e.g. Assassin Cross"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-600"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
                </Button>
                <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white text-xs">
                  Continue <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3: Choose Activities */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 mb-2">
                  <ListChecks className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                  Choose daily activities
                </h2>
                <p className="text-xs text-slate-500">
                  Select activities to automatically assign to this character. You can edit or add more anytime.
                </p>
              </div>

              <div className="space-y-2 pt-2 max-h-60 overflow-y-auto pr-1">
                {activities.map((act) => {
                  const isChecked = selectedActivities.includes(act.id);
                  return (
                    <div
                      key={act.id}
                      onClick={() => toggleActivity(act.id)}
                      className={`flex items-center justify-between p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? "bg-slate-50 border-slate-900/40 text-slate-900 font-medium"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleActivity(act.id)}
                        />
                        <span>{act.name}</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {act.code}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(2)}
                  className="text-xs text-slate-600"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium"
                >
                  Complete Setup <Check className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

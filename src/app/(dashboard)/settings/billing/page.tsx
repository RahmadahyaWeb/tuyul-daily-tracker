import { requireWorkspace } from "@/lib/workspace";
import { SettingsLayout } from "@/features/settings/SettingsLayout";
import { BillingSettingsView } from "@/features/settings/BillingSettingsView";
import { getUserBillingRequest } from "@/server/actions/billing";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing & Plans",
  description: "Manage your subscription, plan limits, and invoices",
};

export const dynamic = "force-dynamic";

export default async function BillingSettingsPage() {
  const [{ workspace }, billingRequest] = await Promise.all([
    requireWorkspace(),
    getUserBillingRequest(),
  ]);

  return (
    <SettingsLayout>
      <BillingSettingsView
        workspace={workspace}
        initialBillingRequest={billingRequest}
      />
    </SettingsLayout>
  );
}

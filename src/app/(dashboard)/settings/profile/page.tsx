import { requireUser } from "@/lib/auth";
import { SettingsLayout } from "@/features/settings/SettingsLayout";
import { ProfileSettingsView } from "@/features/settings/ProfileSettingsView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile Settings",
  description: "Manage your personal profile and account credentials",
};

export const dynamic = "force-dynamic";

export default async function ProfileSettingsPage() {
  const user = await requireUser();

  return (
    <SettingsLayout>
      <ProfileSettingsView user={user} />
    </SettingsLayout>
  );
}

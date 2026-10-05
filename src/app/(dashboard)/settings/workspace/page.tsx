import { requireWorkspace } from "@/lib/workspace";
import { SettingsLayout } from "@/features/settings/SettingsLayout";
import { WorkspaceSettingsView } from "@/features/settings/WorkspaceSettingsView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workspace Settings",
  description: "Manage your workspace settings and team preferences",
};

export const dynamic = "force-dynamic";

export default async function WorkspaceSettingsPage() {
  const { workspace } = await requireWorkspace();

  return (
    <SettingsLayout>
      <WorkspaceSettingsView workspace={workspace} />
    </SettingsLayout>
  );
}

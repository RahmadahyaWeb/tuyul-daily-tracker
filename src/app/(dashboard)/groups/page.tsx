import { GroupsView } from "@/features/groups/GroupsView";
import { getGroups } from "@/server/db/queries";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Groups — Tuyul Tracker",
  description: "Manajemen grup akun tuyul Ragnarok",
};

export const dynamic = "force-dynamic";

export default async function GroupsPage() {
  const groups = await getGroups();

  return <GroupsView initialGroups={groups} />;
}

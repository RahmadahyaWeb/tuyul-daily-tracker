import { GroupsView } from "@/features/groups/GroupsView";
import { getGroups } from "@/server/db/queries";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Groups — Dituyulin",
  description: "Account category and group management",
};

export const dynamic = "force-dynamic";

export default async function GroupsPage() {
  const groups = await getGroups();

  return <GroupsView initialGroups={groups} />;
}

import { AccountsView } from "@/features/accounts/AccountsView";
import {
  getAccountsList,
  getMasterActivities,
  getGroups,
} from "@/server/db/queries";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accounts — Dituyulin",
  description: "Account credentials, information, and custom daily checklist management",
};

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const [accounts, activities, groups] = await Promise.all([
    getAccountsList(),
    getMasterActivities(),
    getGroups(),
  ]);

  return (
    <AccountsView
      initialAccounts={accounts}
      activities={activities.filter((a) => a.isActive)}
      groups={groups}
    />
  );
}

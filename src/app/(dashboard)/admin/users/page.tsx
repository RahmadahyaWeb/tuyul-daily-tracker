import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminUsers, getAdminStats } from "@/server/actions/admin";
import { AdminUsersView } from "@/features/admin/AdminUsersView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management — Admin Console",
  description: "Monitor registered users and manage subscription tiers",
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [users, stats] = await Promise.all([
    getAdminUsers(),
    getAdminStats(),
  ]);

  return <AdminUsersView initialUsers={users} stats={stats} />;
}

import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminBillingRequests } from "@/server/actions/admin";
import { AdminBillingView } from "@/features/admin/AdminBillingView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing Approvals — Admin Console",
  description: "Review and approve paid plan upgrade requests",
};

export const dynamic = "force-dynamic";

export default async function AdminBillingPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const requests = await getAdminBillingRequests();

  return <AdminBillingView initialRequests={requests} />;
}

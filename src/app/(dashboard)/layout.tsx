import { AppLayout } from "@/components/layout/AppLayout";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Enforce mandatory onboarding: must have at least 1 account to access dashboard
  const countRes = await sql`
    SELECT count(*)::int as count FROM accounts WHERE user_id = ${session.id};
  `;
  const accountCount = Number(countRes[0]?.count || 0);

  if (accountCount === 0) {
    redirect("/onboarding");
  }

  return <AppLayout user={session}>{children}</AppLayout>;
}

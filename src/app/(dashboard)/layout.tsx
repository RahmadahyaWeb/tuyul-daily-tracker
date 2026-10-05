import { AppLayout } from "@/components/layout/AppLayout";
import { getSession } from "@/lib/auth";
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

  return <AppLayout user={session}>{children}</AppLayout>;
}

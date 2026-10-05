import { AccountDetailView } from "@/features/account-detail/AccountDetailView";
import { getAccountDetail } from "@/server/db/queries";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

interface AccountDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: AccountDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getAccountDetail(id);
  if (!data) return { title: "Account Not Found — Dituyulin" };

  return {
    title: `${data.account.nickname} — Dituyulin`,
    description: `Details, credentials, and 30-day activity history for ${data.account.nickname}`,
  };
}

export default async function AccountDetailPage({
  params,
}: AccountDetailPageProps) {
  const { id } = await params;
  const data = await getAccountDetail(id);

  if (!data) {
    notFound();
  }

  return <AccountDetailView data={data} />;
}

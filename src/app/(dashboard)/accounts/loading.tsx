import { PageSkeleton } from "@/components/ui/skeletons";

export default function AccountsLoading() {
  return <PageSkeleton filterCount={3} rowCount={6} />;
}

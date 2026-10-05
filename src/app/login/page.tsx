import { LoginForm } from "@/features/auth/LoginForm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Dituyulin",
  description: "Sign in to Dituyulin Workspace",
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/");
  }

  return <LoginForm />;
}

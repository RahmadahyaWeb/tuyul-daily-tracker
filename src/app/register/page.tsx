import { RegisterForm } from "@/features/auth/RegisterForm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register — Dituyulin",
  description: "Create your account on Dituyulin",
};

export default async function RegisterPage() {
  const session = await getSession();
  if (session) {
    redirect("/");
  }

  return <RegisterForm />;
}

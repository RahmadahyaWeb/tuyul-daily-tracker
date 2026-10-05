import { RegisterForm } from "@/features/auth/RegisterForm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register — Tuyul Tracker",
  description: "Create your account on Tuyul Tracker",
};

export default async function RegisterPage() {
  const session = await getSession();
  if (session) {
    redirect("/");
  }

  return <RegisterForm />;
}

import { ForgotPasswordForm } from "@/features/auth/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password — Dituyulin",
  description: "Reset your Dituyulin workspace password",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}

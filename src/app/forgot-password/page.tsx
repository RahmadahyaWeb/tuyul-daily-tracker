import { ForgotPasswordForm } from "@/features/auth/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your Tuyul Tracker password",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}

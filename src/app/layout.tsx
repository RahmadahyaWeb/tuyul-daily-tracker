import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Tuyul Tracker — Ragnarok Daily Management",
    template: "%s | Tuyul Tracker",
  },
  description:
    "Aplikasi pelacak checklist aktivitas harian akun tuyul Ragnarok secara cepat, presisi, dan terstruktur.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 selection:bg-blue-600/30 selection:text-blue-200">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { TopProgressBar } from "@/components/layout/TopProgressBar";
import { Toaster } from "@/components/ui/sonner";
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
    default: "Tuyul Tracker — Keep every account on track",
    template: "%s | Tuyul Tracker",
  },
  description:
    "Track daily activities, progress, and multiple accounts from one simple workspace.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-slate-900 selection:text-white">
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}


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
    default: "Dituyulin — Track every account, the pixel way.",
    template: "%s | Dituyulin",
  },
  description:
    "Track daily quest progress, manage multiple game accounts, and keep character activities organized in a fantasy pixel workspace.",
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
      <body className="min-h-full flex flex-col bg-[#FAF8F5] text-slate-900 selection:bg-slate-900 selection:text-white font-sans">
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}


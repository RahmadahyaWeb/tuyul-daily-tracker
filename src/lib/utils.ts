import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(value: number): string {
  if (isNaN(value)) return "0%";
  return `${Math.round(value)}%`;
}

export function formatZeny(amount: number): string {
  const val = Number(amount) || 0;
  return new Intl.NumberFormat("en-US").format(val) + " Z";
}

export function formatZenyCompact(amount: number): string {
  const val = Number(amount) || 0;
  if (val >= 1_000_000_000) {
    return (val / 1_000_000_000).toLocaleString("en-US", { maximumFractionDigits: 2 }) + "B Z";
  }
  if (val >= 1_000_000) {
    return (val / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 1 }) + "M Z";
  }
  if (val >= 1_000) {
    return (val / 1_000).toLocaleString("en-US", { maximumFractionDigits: 1 }) + "k Z";
  }
  return new Intl.NumberFormat("en-US").format(val) + " Z";
}

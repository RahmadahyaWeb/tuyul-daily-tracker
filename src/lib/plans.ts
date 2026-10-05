export type PlanType = "FREE" | "PRO";

export interface PlanConfig {
  id: PlanType;
  name: string;
  price: string;
  billingPeriod: string;
  description: string;
  maxAccounts: number;
  features: string[];
  isPopular?: boolean;
}

export const PLANS: Record<PlanType, PlanConfig> = {
  FREE: {
    id: "FREE",
    name: "Free",
    price: "$0",
    billingPeriod: "forever",
    description: "For getting started and personal tracking.",
    maxAccounts: 5,
    features: [
      "Up to 5 accounts",
      "Daily activity matrix tracker",
      "Weekly completion history",
      "Master activities & groups",
      "Instant optimistic tracking",
      "Community support",
    ],
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    price: "$9",
    billingPeriod: "per month",
    description: "For power farmers and managing more accounts.",
    maxAccounts: 100,
    isPopular: true,
    features: [
      "Up to 100 accounts",
      "Daily activity matrix tracker",
      "Weekly completion history",
      "Unlimited custom activities & groups",
      "Encrypted credential vault",
      "Instant priority sync",
      "Priority email support",
    ],
  },
};

export function getPlan(planType?: string | null): PlanConfig {
  if (planType === "PRO") {
    return PLANS.PRO;
  }
  return PLANS.FREE;
}

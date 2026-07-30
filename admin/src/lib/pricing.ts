import type { PriceType } from "@/types";

export function formatBirr(amount: number): string {
  return Math.round(amount).toLocaleString("en-US");
}

export function formatCategoryPrice(cat?: {
  priceType?: PriceType;
  price?: number;
} | null): string {
  if (!cat || !cat.priceType || cat.priceType === "negotiable") {
    return "Negotiable";
  }
  const amount = formatBirr(cat.price || 0);
  if (cat.priceType === "monthly") return `${amount} Birr / month`;
  return `${amount} Birr (one time)`;
}

export const PRICE_TYPE_LABELS: Record<PriceType, string> = {
  one_time: "One-time",
  monthly: "Monthly",
  negotiable: "Negotiable",
};

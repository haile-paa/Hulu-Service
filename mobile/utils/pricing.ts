// Categories carry an app-assigned price (set on the backend, never by the
// provider). This helper turns that into a single display string customers
// see everywhere a category/provider is shown.

export type PriceType = "one_time" | "monthly" | "negotiable";

export interface PricedCategory {
  priceType?: PriceType;
  price?: number;
}

// t: the i18next `t` function from useTranslation()
export function formatCategoryPrice(
  cat: PricedCategory | undefined | null,
  t: (key: string) => string,
  language: "am" | "en" = "en",
): string {
  if (!cat || !cat.priceType || cat.priceType === "negotiable") {
    return t("pricing.negotiable");
  }

  const amount = Math.round(cat.price || 0).toLocaleString(
    language === "am" ? "am-ET" : "en-US",
  );
  const birr = t("pricing.birr");

  if (cat.priceType === "monthly") {
    return `${amount} ${birr} / ${t("pricing.perMonth")}`;
  }
  return `${amount} ${birr} ${t("pricing.oneTime")}`;
}
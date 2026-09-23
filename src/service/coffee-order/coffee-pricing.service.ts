/** Currency choices supported by the coffee contribution UI. */
export type CoffeeCurrency = "USD" | "INR";

interface LocaleResponse {
  region?: unknown;
}

/** Resolves and caches the backend's edge-derived locale for the current browser session. */
export class CoffeePricingService {
  private currencyRequest: Promise<CoffeeCurrency> | undefined;

  /** India uses fixed INR option prices; every other or unavailable region uses USD. */
  getCurrency(): Promise<CoffeeCurrency> {
    this.currencyRequest ??= window.portfolioRestClient
      .get<LocaleResponse>()
      .uri("/locale")
      .retrieve()
      .toEntity()
      .then((response) => {
        if (response.status < 200 || response.status >= 300 || typeof response.data?.region !== "string") {
          throw new Error("The payment region could not be resolved.");
        }
        return response.data.region === "IN" ? "INR" : "USD";
      });

    return this.currencyRequest;
  }
}

/** Shared cache prevents each coffee widget from fetching locale independently. */
export const coffeePricingService = new CoffeePricingService();

/** Formats preset and total amounts with the locale appropriate to their fixed currency. */
export function formatCoffeeAmount(amount: number, currency: CoffeeCurrency): string {
  const locale = currency === "INR" ? "en-IN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

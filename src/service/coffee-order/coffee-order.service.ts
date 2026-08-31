/**
 * Transport boundary for the buy-coffee backend feature.
 *
 * The service wraps the two public endpoints — the contribution summary read and
 * payment-link creation — so page components never build requests themselves and
 * so Razorpay's wire shape stays contained in this module.
 */

/** One contributor-facing entry inside the public support history. */
export interface CoffeeContribution {
  /** Contribution value expressed in the smallest currency unit (paise). */
  amount: number;
  /** ISO currency code the contribution was collected in, e.g. `INR`. */
  currency: string;
  /** Contributor display label recorded at payment-link creation. */
  name: string;
  /** Optional short public note supplied by the contributor. */
  shortNote: string | null;
  /** ISO-8601 timestamp recorded when the contribution was created. */
  createdAt: string;
}

/** Response returned by `GET /buy-coffee`. */
export interface CoffeeSummary {
  /** Count of every stored order, done and pending alike. */
  total: number;
  /** At most ten newest contributions, newest first. */
  latest: readonly CoffeeContribution[];
}

/** Response returned by `POST /buy-coffee/order` on success. */
export interface CoffeePaymentLinkResponse {
  /** Razorpay payment-link identifier. */
  id: string;
  /** Hosted Razorpay checkout URL the payer must visit to complete the payment. */
  short_url: string;
}

/** Error body returned by the backend for rejected requests. */
export interface CoffeeApiErrorBody {
  code?: string;
  message?: string;
}

/** Error raised when the buy-coffee endpoints are unavailable or reject a request. */
export class CoffeeOrderApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code?: string,
    message = "The support service is unavailable.",
  ) {
    super(message);
    this.name = "CoffeeOrderApiError";
  }
}

/** Throws for 5xx responses; 4xx bodies surface through the caller's non-2xx check. */
function rejectServerFailure(response: { status: number }): void {
  if (response.status >= 500) {
    throw new CoffeeOrderApiError(response.status);
  }
}

/** Validates and narrows one history entry so bad payloads cannot reach the UI. */
function toContribution(data: unknown): CoffeeContribution | null {
  if (!data || typeof data !== "object") {
    return null;
  }
  const payload = data as { amount?: unknown; currency?: unknown; name?: unknown; shortNote?: unknown; createdAt?: unknown };
  if (typeof payload.amount !== "number" || typeof payload.currency !== "string" || typeof payload.name !== "string") {
    return null;
  }
  return {
    amount: payload.amount,
    currency: payload.currency,
    name: payload.name,
    shortNote: typeof payload.shortNote === "string" ? payload.shortNote : null,
    createdAt: typeof payload.createdAt === "string" && payload.createdAt.length > 0 ? payload.createdAt : new Date().toISOString(),
  };
}

/** Validates and narrows the summary payload returned by the backend. */
function toSummaryResponse(data: unknown): CoffeeSummary {
  if (!data || typeof data !== "object") {
    throw new CoffeeOrderApiError(0, "INVALID_RESPONSE", "The support summary response was invalid.");
  }
  const payload = data as { total?: unknown; latest?: unknown };
  if (typeof payload.total !== "number" || !Array.isArray(payload.latest)) {
    throw new CoffeeOrderApiError(0, "INVALID_RESPONSE", "The support summary response was invalid.");
  }
  return {
    total: payload.total,
    latest: payload.latest.flatMap((entry) => {
      const contribution = toContribution(entry);
      return contribution ? [contribution] : [];
    }),
  };
}

/** Validates and narrows the payment-link payload returned by the backend. */
function toPaymentLinkResponse(data: unknown): CoffeePaymentLinkResponse {
  if (!data || typeof data !== "object") {
    throw new CoffeeOrderApiError(0, "INVALID_RESPONSE", "The payment link response was invalid.");
  }
  const payload = data as { id?: unknown; short_url?: unknown };
  if (typeof payload.id !== "string" || typeof payload.short_url !== "string" || !payload.short_url.startsWith("https://")) {
    throw new CoffeeOrderApiError(0, "INVALID_RESPONSE", "The payment link response was invalid.");
  }
  return { id: payload.id, short_url: payload.short_url };
}

/** Details a supporter confirms on the coffee order form. */
export interface CoffeeOrderDraft {
  /** Contribution value in the smallest currency unit (paise). */
  amount: number;
  /** Trimmed contributor display label; the backend rejects blank names. */
  name: string;
  /** Optional short public note, already trimmed by the caller. */
  shortNote?: string;
}

/** Calls the buy-coffee endpoints and keeps transport handling in one place. */
export class CoffeeOrderService {
  /** Loads the running total and latest contributions for the supporter wall. */
  async getSummary(): Promise<CoffeeSummary> {
    const response = await window.portfolioRestClient
      .get<CoffeeSummary>()
      .uri("/buy-coffee")
      .retrieve()
      .handler(rejectServerFailure)
      .converter(toSummaryResponse)
      .toEntity();

    if (response.status < 200 || response.status >= 300) {
      throw new CoffeeOrderApiError(response.status, undefined, "The support summary could not be loaded.");
    }
    return response.data;
  }

  /**
   * Creates a Razorpay payment link for the confirmed order.
   *
   * Throws {@link CoffeeOrderApiError} for 5xx, non-2xx, or an invalid payload so
   * the checkout can distinguish "service unavailable" from a rejected order.
   */
  async createPaymentLink(draft: CoffeeOrderDraft): Promise<CoffeePaymentLinkResponse> {
    const response = await window.portfolioRestClient
      .post<CoffeePaymentLinkResponse>()
      .uri("/buy-coffee/order")
      .body({ amount: draft.amount, name: draft.name, shortNote: draft.shortNote || null })
      .retrieve()
      .handler(rejectServerFailure)
      .converter(toPaymentLinkResponse)
      .toEntity();

    if (response.status < 200 || response.status >= 300) {
      const body = response.data as unknown as CoffeeApiErrorBody | undefined;
      throw new CoffeeOrderApiError(
        response.status,
        body?.code,
        body?.code === "INVALID_ARGUMENT" ? "Please check your details and try again." : "The payment could not be started.",
      );
    }
    return response.data;
  }
}

export const coffeeOrderService = new CoffeeOrderService();
/** Response fields returned by the subscriber endpoints. */
export interface SubscriptionStatusResponse {
  status?: string;
  code?: string;
  message?: string;
}

type BackendPreference = "BLOG" | "NEWS_LETTER" | "SHOWCASE";
const supportedPreferenceTypes = new Set<BackendPreference>(["BLOG", "NEWS_LETTER", "SHOWCASE"]);

/** Backend delivery categories accepted by the preference endpoints. */
export type SubscriptionPreferenceType = BackendPreference;

/** One delivery preference returned for a subscriber's unsubscribe token. */
export interface SubscriptionPreference {
  type: SubscriptionPreferenceType;
  opted: boolean;
}

/** Subscriber email and delivery choices authorized by an email-link token. */
export interface SubscriptionPreferencesResponse {
  email: string;
  preferences: readonly SubscriptionPreference[];
}

/** HTTP result returned by a subscriber endpoint. */
export interface SubscriptionResponseEntity {
  status: number;
  data: SubscriptionStatusResponse;
}

/** Error raised when the REST client receives an unavailable server response. */
export class SubscriptionApiError extends Error {
  constructor(public readonly status: number, message = "The subscription service is unavailable.") {
    super(message);
    this.name = "SubscriptionApiError";
  }
}

const rejectServerFailure = (response: Response): void => {
  if (response.status >= 500) throw new SubscriptionApiError(response.status);
};

const toStatusResponse = (data: unknown): SubscriptionStatusResponse => {
  if (!data || typeof data !== "object") return {};
  const payload = data as Record<string, unknown>;
  return {
    status: typeof payload.status === "string" ? payload.status : undefined,
    code: typeof payload.code === "string" ? payload.code : undefined,
    message: typeof payload.message === "string" ? payload.message : undefined,
  };
};

const toPreferencesResponse = (data: unknown): SubscriptionPreferencesResponse => {
  if (!data || typeof data !== "object") {
    throw new Error("The subscription preferences response was invalid.");
  }
  const payload = data as { email?: unknown; preferences?: unknown };
  if (typeof payload.email !== "string" || !Array.isArray(payload.preferences)) {
    throw new Error("The subscription preferences response was invalid.");
  }
  return {
    email: payload.email,
    preferences: payload.preferences.flatMap((value) => {
      if (!value || typeof value !== "object") return [];
      const preference = value as { type?: unknown; opted?: unknown };
      return typeof preference.type === "string"
        && supportedPreferenceTypes.has(preference.type as BackendPreference)
        && typeof preference.opted === "boolean"
        ? [{ type: preference.type as BackendPreference, opted: preference.opted }]
        : [];
    }),
  };
};

/** Calls subscriber endpoints and keeps transport, status, and payload handling in one place. */
export class SubscriptionService {
  async confirm(token: string): Promise<SubscriptionResponseEntity> {
    return window.portfolioRestClient
      .post<SubscriptionStatusResponse>()
      .uri("/subscriber/confirm")
      .body({ token })
      .retrieve()
      .handler(rejectServerFailure)
      .converter(toStatusResponse)
      .toEntity();
  }

  async initiate(email: string): Promise<void> {
    const response = await window.portfolioRestClient
      .post<SubscriptionStatusResponse>()
      .uri("/subscriber/initiate")
      .body({ email })
      .retrieve()
      .handler(rejectServerFailure)
      .converter(toStatusResponse)
      .toEntity();

    if (response.status < 200 || response.status >= 300 || response.data.status !== "PENDING") {
      throw new SubscriptionApiError(response.status, "The verification email could not be sent.");
    }
  }

  async unsubscribe(token: string): Promise<void> {
    const response = await window.portfolioRestClient
      .post<SubscriptionStatusResponse>()
      .uri("/subscriber/unsubscribe")
      .body({ token })
      .retrieve()
      .handler(rejectServerFailure)
      .converter(toStatusResponse)
      .toEntity();

    if (response.status < 200 || response.status >= 300 || response.data.status !== "UNSUBSCRIBED") {
      throw new SubscriptionApiError(response.status, "The subscription could not be removed.");
    }
  }

  /** Loads a token-authorized subscriber's current delivery preferences. */
  async loadPreferences(token: string): Promise<SubscriptionPreferencesResponse> {
    const response = await window.portfolioRestClient
      .post<SubscriptionPreferencesResponse>()
      .uri("/subscriber/preferences")
      .body({ token })
      .retrieve()
      .handler(rejectServerFailure)
      .converter(toPreferencesResponse)
      .toEntity();

    if (response.status < 200 || response.status >= 300 || !Array.isArray(response.data.preferences)) {
      throw new SubscriptionApiError(response.status, "Unable to resolve this preference link.");
    }

    return response.data;
  }

  /** Updates one token-authorized delivery preference. */
  async updatePreference(token: string, type: SubscriptionPreferenceType, isOpted: boolean): Promise<void> {
    const response = await window.portfolioRestClient
      .post<SubscriptionStatusResponse>()
      .uri("/subscriber/preferences/toggle")
      .body({ token, type, isOpted })
      .retrieve()
      .handler(rejectServerFailure)
      .converter(toStatusResponse)
      .toEntity();

    if (response.status < 200 || response.status >= 300 || response.data.status?.toUpperCase() !== "UPDATED") {
      throw new SubscriptionApiError(response.status, "Those changes did not reach the server.");
    }
  }
}

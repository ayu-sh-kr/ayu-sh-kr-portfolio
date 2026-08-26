import type {
  PricingStartProjectAttachment,
  PricingStartProjectBrief,
} from "../../events/pricing.events.ts";

/** Scoped upload target granted by the pricing-form backend for one attachment. */
export interface ClientFileUploadResponse {
  uploadUrl: string;
  key: string;
  expiresInSeconds?: number;
}

/** Response returned once the backend records a pricing brief. */
export interface PricingFormSubmissionResponse {
  id: number;
  status: string;
}

/** Optional attachment fields included when the backend knows the storage key. */
type ProjectAttachmentPayload = Pick<PricingStartProjectAttachment, "id" | "name" | "size" | "status"> & { key?: string };

/** Throws for 5xx responses; 4xx bodies surface through the caller's non-2xx check. */
export function rejectServerFailure(response: { status: number }): void {
  if (response.status >= 500) {
    throw new PricingFormApiError(response.status);
  }
}

/** Validates and narrows the upload-URL payload returned by the backend. */
export function toUploadUrlResponse(data: unknown): ClientFileUploadResponse {
  if (!data || typeof data !== "object") {
    throw new PricingFormApiError(0, "The upload URL response was invalid.");
  }
  const payload = data as { uploadUrl?: unknown; key?: unknown; expiresInSeconds?: unknown };
  if (typeof payload.uploadUrl !== "string" || typeof payload.key !== "string") {
    throw new PricingFormApiError(0, "The upload URL response was invalid.");
  }
  return {
    uploadUrl: payload.uploadUrl,
    key: payload.key,
    expiresInSeconds: typeof payload.expiresInSeconds === "number" ? payload.expiresInSeconds : undefined,
  };
}

/** Validates and narrows the submission payload returned by the backend. */
export function toSubmissionResponse(data: unknown): PricingFormSubmissionResponse {
  if (!data || typeof data !== "object") {
    throw new PricingFormApiError(0, "The submission response was invalid.");
  }
  const payload = data as { id?: unknown; status?: unknown };
  if (typeof payload.id !== "number" || payload.status !== "RECEIVED") {
    throw new PricingFormApiError(0, "The submission response was invalid.");
  }
  return { id: payload.id, status: payload.status };
}

/**
 * Maps the authored next-step labels the brief retains for display to the server-owned enum names
 * the pricing-form backend deserializes.
 *
 * The shell stores labels for the preview and prepared email; only the submitted request carries
 * the code so Jackson's default enum-by-name binding accepts it. The backend defines no labels for
 * `existing`, `budget`, `timeline`, or `workType`, so those continue to cross the wire as authored
 * display text and are not translated here.
 */
const PRICING_NEXT_STEP_CODES: Readonly<Record<string, string>> = {
  "Reply by email": "REPLY_BY_EMAIL",
  "20-minute call": "TWENTY_MINUTE_CALL",
};

/**
 * Translates the shell's retained brief into the per-mode payload the backend expects.
 *
 * The shell stores every branch's fields on one record regardless of the active mode; the
 * controller's discrimininated schema only accepts the fields for the branch named by `mode`,
 * so this helper returns just that branch's copy plus the shared base. Optional empty strings
 * become `null` rather than `""` because the generated nullable schema rejects empty text.
 */
export function toPricingFormRequest(brief: PricingStartProjectBrief): Record<string, unknown> {
  const attachments: ProjectAttachmentPayload[] = brief.files
    .filter((file) => file.status === "uploaded" && file.key)
    .map((file) => ({ id: file.id, name: file.name, size: file.size, status: file.status, key: file.key }));

  const base: Record<string, unknown> = {
    mode: brief.mode,
    name: brief.name,
    email: brief.email,
    company: brief.company || null,
    needsNda: brief.needsNda,
    nextStep: PRICING_NEXT_STEP_CODES[brief.nextStep] ?? brief.nextStep,
    existing: brief.existing,
    files: attachments,
  };

  if (brief.mode === "spec") {
    return {
      ...base,
      projectName: brief.projectName,
      specLink: brief.specLink || null,
      specNotes: brief.specNotes || null,
    };
  }

  if (brief.mode === "idea") {
    return {
      ...base,
      idea: brief.idea,
      audience: brief.audience,
      success: brief.success,
      budget: brief.budget || null,
      timeline: brief.timeline || null,
    };
  }

  return {
    ...base,
    workType: brief.workType,
    scope: brief.scope,
    constraints: brief.constraints || null,
    budget: brief.budget || null,
    timeline: brief.timeline || null,
  };
}

/** Error raised when the pricing-form endpoints are unavailable or reject the request. */
export class PricingFormApiError extends Error {
  readonly status: number;

  constructor(status: number, message = "The file upload service is unavailable.") {
    super(message);
    this.name = "PricingFormApiError";
    this.status = status;
  }
}

/** Calls the pricing-form attachment endpoints and keeps transport handling in one place. */
export class PricingFormService {

  /**
   * Requests a pre-signed PUT URL for one attachment.
   *
   * The backend issues a short-lived URL scoped to a single object key in the
   * temporary client-intake bucket, so the browser can upload the file body
   * directly to S3 without it transiting the backend.
   */
  async createUploadUrl(file: File): Promise<ClientFileUploadResponse> {
    const response = await window.portfolioRestClient
      .post<ClientFileUploadResponse>()
      .uri("/pricing-form/files/upload-url")
      .body({ fileName: file.name, contentType: file.type || "application/octet-stream" })
      .retrieve()
      .handler(rejectServerFailure)
      .converter(toUploadUrlResponse)
      .toEntity();

    if (response.status < 200 || response.status >= 300) {
      throw new PricingFormApiError(response.status, "The upload URL could not be created.");
    }

    return response.data;
  }

  /**
   * Uploads the file body directly to the pre-signed bucket URL.
   *
   * Uses plain `fetch` rather than the shared rest client because the target is
   * an absolute storage URL outside the configured API base; only the scoped
   * headers the backend expects are sent so the signed URL stays valid.
   */
  async uploadFile(file: File, access: ClientFileUploadResponse): Promise<void> {
    const response = await fetch(access.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });

    if (!response.ok) {
      throw new PricingFormApiError(response.status, "The file could not be uploaded.");
    }
  }

  /**
   * Submits the completed brief and returns the backend's tracking id.
   *
   * Throws {@link PricingFormApiError} for 5xx, non-2xx, or a payload that is missing the
   * RECEIVED status so the caller can distinguish "service unavailable" from a rejected body.
   */
  async submitBrief(brief: PricingStartProjectBrief): Promise<PricingFormSubmissionResponse> {
    const response = await window.portfolioRestClient
      .post<PricingFormSubmissionResponse>()
      .uri("/pricing-form")
      .body(toPricingFormRequest(brief))
      .retrieve()
      .handler(rejectServerFailure)
      .converter(toSubmissionResponse)
      .toEntity();

    if (response.status < 200 || response.status >= 300) {
      throw new PricingFormApiError(response.status, "The brief could not be submitted.");
    }

    return response.data;
  }
}

export const pricingFormService = new PricingFormService();

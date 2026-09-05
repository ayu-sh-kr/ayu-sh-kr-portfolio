/**
 * Upload access returned by a form-specific backend endpoint.
 * The URL is temporary and scoped to the returned key; callers retain the key with their form
 * metadata so the backend can associate the object after the browser finishes the direct upload.
 */
export interface ClientFileUploadResponse {
  /** Signed PUT destination used for the one selected file. */
  uploadUrl: string;
  /** Server-owned intake key that identifies the uploaded object. */
  key: string;
  /** Optional validity window exposed by the backend for client-side upload state. */
  expiresInSeconds?: number;
}

/**
 * Validates the upload target before a browser PUT begins.
 * Keeping this boundary strict prevents an incomplete response from reaching `fetch`, where the
 * resulting failure would be harder to relate to the form that requested the upload.
 */
export function toClientFileUploadResponse(data: unknown): ClientFileUploadResponse {
  if (!data || typeof data !== "object") {
    throw new ClientFileUploadApiError(0, "The upload URL response was invalid.");
  }
  const payload = data as { uploadUrl?: unknown; key?: unknown; expiresInSeconds?: unknown };
  if (typeof payload.uploadUrl !== "string" || typeof payload.key !== "string") {
    throw new ClientFileUploadApiError(0, "The upload URL response was invalid.");
  }
  return {
    uploadUrl: payload.uploadUrl,
    key: payload.key,
    expiresInSeconds: typeof payload.expiresInSeconds === "number" ? payload.expiresInSeconds : undefined,
  };
}

/**
 * Error raised when a form cannot obtain an upload target or storage rejects its direct PUT.
 * The status is retained for callers that distinguish an unavailable API from a failed storage
 * request, while the message stays suitable for presenting as a generic form error.
 */
export class ClientFileUploadApiError extends Error {
  /** HTTP status associated with the API or direct storage response; zero means invalid data. */
  readonly status: number;

  constructor(status: number, message = "The file upload service is unavailable.") {
    super(message);
    this.name = "ClientFileUploadApiError";
    this.status = status;
  }
}

/**
 * Shares the two-step browser upload protocol between pricing and support forms.
 * Each form supplies its own endpoint and error factory, while URL validation, status handling,
 * content-type selection, and the direct PUT remain one tested implementation.
 */
export class ClientFileUploadService {
  constructor(
    private readonly endpoint: string,
    private readonly createError: (status: number, message?: string) => ClientFileUploadApiError =
      (status, message) => new ClientFileUploadApiError(status, message),
  ) {}

  /**
   * Requests a temporary object target from the configured form endpoint.
   * The browser sends only the file name and content type to the API; the returned key and URL
   * are server-owned and are validated before the caller can begin the direct upload.
   */
  async createUploadUrl(file: File): Promise<ClientFileUploadResponse> {
    const response = await window.portfolioRestClient
      .post<ClientFileUploadResponse>()
      .uri(this.endpoint)
      .body({ fileName: file.name, contentType: file.type || "application/octet-stream" })
      .retrieve()
      .handler((response) => {
        if (response.status >= 500) {
          throw this.createError(response.status);
        }
      })
      .converter((data) => {
        try {
          return toClientFileUploadResponse(data);
        } catch (error) {
          throw this.createError(
            0,
            error instanceof Error ? error.message : "The upload URL response was invalid.",
          );
        }
      })
      .toEntity();

    if (response.status < 200 || response.status >= 300) {
      throw this.createError(response.status, "The upload URL could not be created.");
    }

    return response.data;
  }

  /**
   * Sends the file body directly to the signed storage URL.
   * The API is bypassed for the bytes themselves, and only the signed URL's expected content type
   * is sent so the storage request remains within the scope granted by the backend.
   */
  async uploadFile(file: File, access: ClientFileUploadResponse): Promise<void> {
    const response = await fetch(access.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });

    if (!response.ok) {
      throw this.createError(response.status, "The file could not be uploaded.");
    }
  }
}

import {
  ClientFileUploadApiError,
  ClientFileUploadService,
  type ClientFileUploadResponse,
} from "@app/service/client-file-upload.service.ts";

/** Attachment metadata accepted by the support ticket JSON contract after a successful upload. */
export interface SupportTicketAttachment {
  /** Browser-generated correlation ID retained when the backend promotes the object. */
  id: string;
  /** Original name shown to the support reviewer. */
  name: string;
  /** Browser-reported size in bytes. */
  size: number;
  /** Completed client upload state persisted with the request. */
  status: "uploaded";
  /** Server-issued intake key used to locate and promote the staged object. */
  key: string;
}

/** Complete support form payload sent after every selected attachment has settled. */
export interface SupportTicketRequest {
  /** Contact name retained as a queryable backend field. */
  name: string;
  /** Reply destination retained as a queryable backend field. */
  email: string;
  /** Optional topic selected from the support form pills. */
  topic: string | null;
  /** Request context supplied in the required details field. */
  message: string;
  /** Successfully uploaded files; failed or removed selections are omitted. */
  files: SupportTicketAttachment[];
}

/** Acknowledgement returned after the backend saves and promotes a support request. */
export interface SupportTicketSubmissionResponse {
  /** Generated database ID used to correlate the accepted request. */
  id: number;
  /** Backend acceptance state; the public contract currently permits only `RECEIVED`. */
  status: "RECEIVED";
}

/**
 * Error exposed to the support component when submission cannot cross the backend boundary.
 * It preserves the HTTP status without exposing response payloads in the form UI.
 */
export class SupportTicketApiError extends Error {
  /** HTTP status for rejected requests; zero identifies an invalid response payload. */
  readonly status: number;

  constructor(status: number, message = "The support service is unavailable.") {
    super(message);
    this.name = "SupportTicketApiError";
    this.status = status;
  }
}

/**
 * Owns the support form's attachment transport boundary.
 * It binds the shared browser upload protocol to the support endpoint, leaving components to
 * track file selection and display state without duplicating request or storage details.
 */
export class SupportTicketService {
  /** Uses the support route and translates shared upload failures to the support error contract. */
  private readonly clientFileUploadService = new ClientFileUploadService(
    "/support-ticket/files/upload-url",
    (status, message) => {
      const error = new ClientFileUploadApiError(status, message);
      error.name = "SupportTicketApiError";
      return error;
    },
  );

  /**
   * Requests a support-scoped intake key for one selected file.
   * The returned URL is valid only for the matching file content type and is passed to
   * {@link uploadFile} before the key is retained in the support form state.
   */
  createUploadUrl(file: File): Promise<ClientFileUploadResponse> {
    return this.clientFileUploadService.createUploadUrl(file);
  }

  /**
   * Uploads one selected file directly to the server-issued intake URL.
   * This method intentionally sends bytes to storage rather than the API, so the support component
   * can handle upload progress and failure without adding a second transport implementation.
   */
  uploadFile(file: File, access: ClientFileUploadResponse): Promise<void> {
    return this.clientFileUploadService.uploadFile(file, access);
  }

  /**
   * Sends the completed support request after the component has awaited its file uploads.
   * Only a successful 2xx response containing a numeric ID and `RECEIVED` status can advance the
   * UI to confirmation; API failures and malformed payloads remain explicit service errors.
   */
  async submitTicket(request: SupportTicketRequest): Promise<SupportTicketSubmissionResponse> {
    const response = await window.portfolioRestClient
      .post<SupportTicketSubmissionResponse>()
      .uri("/support-ticket")
      .body(request)
      .retrieve()
      .handler((result) => {
        if (result.status >= 500) {
          throw new SupportTicketApiError(result.status);
        }
      })
      .converter((data) => {
        if (!data || typeof data !== "object") {
          throw new SupportTicketApiError(0, "The support response was invalid.");
        }
        const payload = data as { id?: unknown; status?: unknown };
        if (typeof payload.id !== "number" || payload.status !== "RECEIVED") {
          throw new SupportTicketApiError(0, "The support response was invalid.");
        }
        return { id: payload.id, status: payload.status };
      })
      .toEntity();

    if (response.status < 200 || response.status >= 300) {
      throw new SupportTicketApiError(response.status, "The support request could not be submitted.");
    }
    return response.data;
  }
}

export const supportTicketService = new SupportTicketService();

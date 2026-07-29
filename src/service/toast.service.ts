/**
 * Visual outcome carried by an open toast's feathered fill and its natural-exit glyph.
 *
 * Callers choose one of these through {@link ToastService.note}, {@link ToastService.done},
 * or {@link ToastService.fail}; the mounted host maps it to the shared visual treatment.
 */
export type ToastTone = "note" | "done" | "fail";

/**
 * Valid anchors for notifications created after a position change.
 *
 * {@link ToastService.position} stores this on the singleton rail so application code never
 * needs to know how a corner maps to responsive CSS.
 */
export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

/**
 * A complete in-place replacement for an active toast.
 *
 * Action callbacks return this when their result is not the normal completed-message path;
 * the host retains the existing pill and restarts its countdown with these values.
 */
export interface ToastTransition {
  /** Outcome treatment for the replacement message. */
  tone: ToastTone;
  /** Replacement message announced in the existing toast. */
  message: string;
  /** Optional new lifespan in milliseconds. */
  duration?: number;
}

/**
 * A temporary control rendered inside the toast while its fill drains.
 *
 * The action owns the domain work, while the host owns focus, dismissal, and any returned
 * in-place outcome so callers do not need to manipulate toast DOM.
 */
export interface ToastAction {
  /** Visible action label. */
  label: string;
  /** Optional work. A returned string becomes a completed message; a transition controls its full outcome. */
  onClick?: (id: string) => void | string | ToastTransition;
}

/**
 * Optional behavior supplied with the three direct publishing methods.
 *
 * The host applies defaults that preserve the notification grammar: an identity coalesces,
 * an action gets its longer window, and sticky records require an explicit dismissal.
 */
export interface ToastOptions {
  /** Stable identity used to coalesce repeated notifications. */
  id?: string;
  /** Time before the notification expires. Omit for the tone default. */
  duration?: number;
  /** Keeps the toast visible until a caller or visitor dismisses it. */
  sticky?: boolean;
  /** An optional action shown while the toast is active. */
  action?: ToastAction;
}

/**
 * Copy and identity for a promise-backed notification.
 *
 * {@link ToastService.promise} creates one indeterminate record with `pending`, then changes
 * that same record to the resolved or rejected copy instead of stacking a second notification.
 */
export interface ToastPromiseOptions<T> {
  /** Stable identity used for the whole request lifecycle. */
  id?: string;
  /** Indeterminate message shown until the work settles. */
  pending: string;
  /** Success message, or a function that formats the resolved value. */
  done: string | ((value: T) => string);
  /** Failure message, or a function that formats the rejection reason. */
  fail?: string | ((reason: unknown) => string);
}

/**
 * Runtime bridge between the public service and the persistent `<dota-toast>` host.
 *
 * The service is intentionally DOM-free; this contract lets it delegate lifecycle, rendering,
 * and interaction to the host that connects during application startup.
 */
export interface ToastHost {
  /** Opens or coalesces a notification and returns its identity. */
  show(tone: ToastTone, message: string, options?: ToastOptions): string;
  /** Changes the shared rail anchor for subsequent notifications. */
  position(position: ToastPosition): void;
  /** Dismisses one active notification. */
  dismiss(id: string): void;
  /** Dismisses every active notification. */
  clear(): void;
  /** Uses one toast for the pending and settled states of a promise. */
  promise<T>(work: Promise<T> | (() => Promise<T>), options: ToastPromiseOptions<T>): Promise<T>;
}

/**
 * Public, DOM-free entry point for the app's singleton notification rail.
 *
 * Import {@link Toast} from interaction code after startup. The mounted `dota-toast` component
 * connects itself here, so every caller shares coalescing, clock, and accessibility behavior.
 */
export class ToastService {
  private host: ToastHost | null = null;

  /** Registers the mounted host so application handlers can publish notifications. */
  connect(host: ToastHost): void {
    this.host = host;
  }

  /** Clears the host only when the disconnecting element is still the active host. */
  disconnect(host: ToastHost): void {
    if (this.host === host) {
      this.host = null;
    }
  }

  /** Publishes a neutral informational notification. */
  note(message: string, options?: ToastOptions): string {
    return this.hostOrThrow().show("note", message, options);
  }

  /** Publishes a completed-work notification. */
  done(message: string, options?: ToastOptions): string {
    return this.hostOrThrow().show("done", message, options);
  }

  /** Publishes a failure notification and announces it assertively. */
  fail(message: string, options?: ToastOptions): string {
    return this.hostOrThrow().show("fail", message, options);
  }

  /** Selects the anchor for subsequently created notifications. */
  position(position: ToastPosition): void {
    this.hostOrThrow().position(position);
  }

  /** Dismisses a notification with the visitor-initiated exit treatment. */
  dismiss(id: string): void {
    this.hostOrThrow().dismiss(id);
  }

  /** Dismisses all active notifications. */
  clear(): void {
    this.hostOrThrow().clear();
  }

  /** Keeps one toast in place while the supplied work moves from pending to its result. */
  promise<T>(work: Promise<T> | (() => Promise<T>), options: ToastPromiseOptions<T>): Promise<T> {
    return this.hostOrThrow().promise(work, options);
  }

  /** Makes startup ordering errors clear to the caller. */
  private hostOrThrow(): ToastHost {
    if (!this.host) {
      throw new Error("Toast is not ready. Mount <dota-toast> in index.html before publishing a toast.");
    }

    return this.host;
  }
}

/** Shared toast API for client-side handlers. */
export const Toast = new ToastService();

/** Built-in dialog treatments. `risk` keeps the destructive action visually restrained. */
export type AlertTone = "note" | "ask" | "risk";

/**
 * Copy and optional confirmation work for the built-in dialog.
 *
 * `Alert.note`, `Alert.ask`, and `Alert.risk` add their tone themselves. When
 * `onConfirm` is present, the mounted alert keeps the dialog open until it
 * resolves; a rejection is displayed in the dialog.
 */
export interface AlertOptions<TValue = true, TResult = TValue> {
  /** Question shown as the dialog heading. */
  title: string;
  /** Optional consequence or supporting context. */
  body?: string;
  /** Primary action label. */
  confirm?: string;
  /** Safe-exit label for confirmation dialogs. */
  cancel?: string;
  /** Primary label while `onConfirm` is pending. */
  busy?: string;
  /** Work performed after confirmation; its result becomes the resolved value. */
  onConfirm?: (value: TValue) => TResult | Promise<TResult>;
}

/**
 * The one optional text field supported by `Alert.prompt`.
 *
 * Its guard receives the raw value while the returned prompt value is trimmed.
 */
export interface AlertFieldOptions {
  /** Visible field label. */
  label: string;
  /** Optional short constraint beside the label. */
  hint?: string;
  /** Input placeholder. */
  placeholder?: string;
  /** Initial input value. */
  value?: string;
  /** Returns whether the current value can be confirmed. */
  guard?: (value: string) => boolean;
}

/** Built-in prompt options, adding its text field and optional destructive tone. */
export interface AlertPromptOptions<TResult = string> extends AlertOptions<string, TResult> {
  /** Field rendered below the question. */
  field: AlertFieldOptions;
  /** Use `risk` for a type-to-confirm prompt; otherwise the prompt uses `ask`. */
  tone?: "ask" | "risk";
}

/**
 * Controls handed to a caller-owned alert element.
 *
 * Use `run` from a custom action button to retain the native dialog's pending
 * lock and error treatment. `resolve` is for an action that is already complete.
 */
export interface AlertController<TResult> {
  /** Resolves the active custom alert and begins its exit transition. */
  resolve(value: TResult): void;
  /** Resolves the active custom alert with its configured cancellation value. */
  cancel(): void;
  /** Runs work under the dialog pending lock and resolves its returned value. */
  run(action: () => TResult | Promise<TResult>): Promise<void>;
}

/**
 * A caller-owned alert view rendered inside the shared native dialog.
 *
 * Pass an existing element for static content, or a factory to wire its buttons
 * to the supplied {@link AlertController}. The component keeps queueing and
 * dismissal behavior; the caller owns the view's markup and visual state.
 */
export interface AlertCustomOptions<TResult> {
  /** Name announced for the custom dialog. */
  ariaLabel: string;
  /** Element to mount, or a factory that receives its controller. */
  content: HTMLElement | ((controller: AlertController<TResult>) => HTMLElement);
  /** Value resolved when the custom view is cancelled. */
  cancelValue: TResult;
  /** Set to `false` when only the custom view's own controls may dismiss it. */
  dismissible?: boolean;
}

/** Bridge implemented by the one `dota-alert` element mounted in `index.html`. */
export interface AlertHost {
  /** Queues a built-in request. */
  openBuiltIn<TValue, TResult>(options: AlertOptions<TValue, TResult> & { tone: AlertTone; field?: AlertFieldOptions }): Promise<TResult | TValue | false | null>;
  /** Queues caller-owned content. */
  openCustom<TResult>(options: AlertCustomOptions<TResult>): Promise<TResult>;
}

/**
 * Public entry point for the app's serialized native dialog.
 *
 * The single `dota-alert` host connects during startup. Import {@link Alert}
 * in client-side handlers; each call waits for any visible dialog to settle.
 */
export class AlertService {
  private host: AlertHost | null = null;

  /** Registers the mounted host so calls can reach the native dialog. */
  connect(host: AlertHost): void {
    this.host = host;
  }

  /** Clears the host only if the disconnecting element is still the active one. */
  disconnect(host: AlertHost): void {
    if (this.host === host) {
      this.host = null;
    }
  }

  /** Opens a one-button acknowledgement; ESC or its backdrop resolve `false`. */
  note(options: Omit<AlertOptions<true, true>, "cancel" | "busy" | "onConfirm">): Promise<true | false> {
    return this.hostOrThrow().openBuiltIn({ ...options, tone: "note" }) as Promise<true | false>;
  }

  /** Opens a reversible confirmation and returns `false` for its safe exit. */
  ask<TResult = true>(options: AlertOptions<true, TResult>): Promise<TResult | true | false> {
    return this.hostOrThrow().openBuiltIn({ ...options, tone: "ask" }) as Promise<TResult | true | false>;
  }

  /** Opens a destructive confirmation, focusing Cancel and ignoring backdrop clicks. */
  risk<TResult = true>(options: AlertOptions<true, TResult>): Promise<TResult | true | false> {
    return this.hostOrThrow().openBuiltIn({ ...options, tone: "risk" }) as Promise<TResult | true | false>;
  }

  /** Opens one guarded text field and returns `null` when it is cancelled. */
  prompt<TResult = string>(options: AlertPromptOptions<TResult>): Promise<TResult | string | null> {
    return this.hostOrThrow().openBuiltIn({ ...options, tone: options.tone ?? "ask" }) as Promise<TResult | string | null>;
  }

  /** Opens a caller-owned element under the shared queue, native focus trap, and pending lock. */
  custom<TResult>(options: AlertCustomOptions<TResult>): Promise<TResult> {
    return this.hostOrThrow().openCustom(options);
  }

  /** Fails clearly when application code calls Alert before the singleton host connects. */
  private hostOrThrow(): AlertHost {
    if (!this.host) {
      throw new Error("Alert is not ready. Mount <dota-alert> in index.html before opening an alert.");
    }

    return this.host;
  }
}

/** Shared alert API for client-side handlers. */
export const Alert = new AlertService();

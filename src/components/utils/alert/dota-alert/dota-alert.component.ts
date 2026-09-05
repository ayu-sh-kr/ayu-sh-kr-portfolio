import { BaseElement, BindEvent, Component, HostListener, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import {
  Alert,
  type AlertController,
  type AlertCustomOptions,
  type AlertFieldOptions,
  type AlertHost,
  type AlertOptions,
  type AlertTone,
} from "@app/service/alert.service.ts";

/** States of the single dialog machine from initial idle through an animated exit. */
type AlertState = "closed" | "open" | "pending" | "closing";

/** A queued built-in configuration together with the promise resolver awaiting its answer. */
interface BuiltInAlertJob<TValue, TResult> {
  /** Distinguishes standard component content from a caller-owned view. */
  kind: "built-in";
  /** Content, tone, optional field, and confirmation work rendered by the shared shell. */
  options: AlertOptions<TValue, TResult> & { tone: AlertTone; field?: AlertFieldOptions };
  /** Resolves the public API promise after exit motion finishes. */
  resolve: (value: TResult | TValue | false | null) => void;
}

/** A queued caller-owned view together with the promise resolver awaiting its controller result. */
interface CustomAlertJob<TResult> {
  /** Distinguishes caller-owned content from a built-in alert. */
  kind: "custom";
  /** Content factory and dismissal behavior supplied by the API caller. */
  options: AlertCustomOptions<TResult>;
  /** Resolves the public API promise after exit motion finishes. */
  resolve: (value: TResult) => void;
}

/** Every queued item the host can write into its persistent native dialog. */
type AlertJob = BuiltInAlertJob<unknown, unknown> | CustomAlertJob<unknown>;

/** Tone-specific line glyphs rendered in the one shared icon circle. */
const GLYPHS: Record<AlertTone, string> = {
  note: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 11.4v5"></path><circle cx="12" cy="7.7" r="1.05"></circle></svg>`,
  ask: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M9.5 9.4a2.6 2.6 0 1 1 3.3 2.7c-.6.2-.9.7-.9 1.3v.5"></path><circle cx="12" cy="16.4" r="1.05"></circle></svg>`,
  risk: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 7.4v5.2"></path><circle cx="12" cy="16.5" r="1.05"></circle></svg>`,
};

/**
 * Native-dialog host for every blocking alert in the application.
 *
 * `index.html` mounts this element beside the routed app. {@link Alert} sends
 * it standard or caller-owned content; the component serializes jobs and
 * resolves each promise only after the native dialog has settled.
 *
 * Selector: `dota-alert`.
 */
@Component({
  selector: "dota-alert",
  shadow: false,
})
export class DotaAlertComponent extends BaseElement implements AlertHost {
  private dialog!: HTMLDialogElement;
  private builtInPanel!: HTMLElement;
  private customPanel!: HTMLElement;
  private customContent!: HTMLElement;
  private titleElement!: HTMLElement;
  private body!: HTMLElement;
  private icon!: HTMLElement;
  private field!: HTMLElement;
  private label!: HTMLLabelElement;
  private hint!: HTMLElement;
  private input!: HTMLInputElement;
  private builtInError!: HTMLElement;
  private customError!: HTMLElement;
  private cancelButton!: HTMLButtonElement;
  private confirmButton!: HTMLButtonElement;
  private confirmLabel!: HTMLElement;
  private state: AlertState = "closed";
  private activeJob: AlertJob | null = null;
  private readonly queue: AlertJob[] = [];
  private savedPaddingInlineEnd = "";
  private enterFrame: number | null = null;
  private focusTimer: number | null = null;
  private closeTimer: number | null = null;
  private readonly handleDialogCancel = (event: Event): void => this.handleNativeCancel(event);

  /**
   * Creates the host without touching the DOM.
   *
   * Dota renders the stable dialog markup before the connected lifecycle wires
   * its elements and public API registration.
   */
  constructor() {
    super();
  }

  /**
   * Captures the one dialog node after Dota has rendered it and makes it available to {@link Alert}.
   *
   * The native `cancel` event does not bubble, so it is attached directly here;
   * the remaining child events use Dota's delegated bindings below.
   */
  @OnEvent("connected", true)
  onConnected(): void {
    this.dialog = this.querySelector<HTMLDialogElement>("#dota-alert-dialog")!;
    this.builtInPanel = this.querySelector<HTMLElement>("#dota-alert-built-in")!;
    this.customPanel = this.querySelector<HTMLElement>("#dota-alert-custom")!;
    this.customContent = this.querySelector<HTMLElement>("#dota-alert-custom-content")!;
    this.titleElement = this.querySelector<HTMLElement>("#dota-alert-title")!;
    this.body = this.querySelector<HTMLElement>("#dota-alert-body")!;
    this.icon = this.querySelector<HTMLElement>("#dota-alert-icon")!;
    this.field = this.querySelector<HTMLElement>("#dota-alert-field")!;
    this.label = this.querySelector<HTMLLabelElement>("#dota-alert-label")!;
    this.hint = this.querySelector<HTMLElement>("#dota-alert-hint")!;
    this.input = this.querySelector<HTMLInputElement>("#dota-alert-input")!;
    this.builtInError = this.querySelector<HTMLElement>("#dota-alert-built-in-error")!;
    this.customError = this.querySelector<HTMLElement>("#dota-alert-custom-error")!;
    this.cancelButton = this.querySelector<HTMLButtonElement>("#dota-alert-cancel")!;
    this.confirmButton = this.querySelector<HTMLButtonElement>("#dota-alert-confirm")!;
    this.confirmLabel = this.querySelector<HTMLElement>("#dota-alert-confirm-label")!;
    this.dialog.addEventListener("cancel", this.handleDialogCancel);
    Alert.connect(this);
  }

  /**
   * Releases native resources and resolves outstanding callers if the host is removed.
   *
   * The production host is a stable `index.html` sibling, but this cleanup keeps
   * route teardown, tests, and future embedding from leaving a promise stranded.
   */
  @OnEvent("disconnected", true)
  onDisconnected(): void {
    this.dialog?.removeEventListener("cancel", this.handleDialogCancel);
    this.cancelScheduledWork();
    this.unlockPageScroll();
    Alert.disconnect(this);

    if (this.activeJob) {
      this.activeJob.resolve(this.cancelValue(this.activeJob) as never);
      this.activeJob = null;
    }

    while (this.queue.length) {
      const queuedJob = this.queue.shift()!;
      queuedJob.resolve(this.cancelValue(queuedJob) as never);
    }

    this.state = "closed";
  }

  /**
   * Accepts a built-in request from {@link AlertService} and returns its eventual answer.
   *
   * The request is queued when another job owns the dialog; the dialog node and
   * its framework event bindings are never recreated for a new request.
   */
  openBuiltIn<TValue, TResult>(options: AlertOptions<TValue, TResult> & { tone: AlertTone; field?: AlertFieldOptions }): Promise<TResult | TValue | false | null> {
    return new Promise((resolve) => {
      this.enqueue({ kind: "built-in", options, resolve } as BuiltInAlertJob<unknown, unknown>);
    });
  }

  /**
   * Accepts caller-owned content under the same native-dialog lifecycle as built-ins.
   *
   * The element is mounted only when it reaches the front of the queue, which
   * lets its controller settle the exact custom job that created it.
   */
  openCustom<TResult>(options: AlertCustomOptions<TResult>): Promise<TResult> {
    return new Promise((resolve) => {
      this.enqueue({ kind: "custom", options, resolve } as CustomAlertJob<unknown>);
    });
  }

  /**
   * Routes native form submission into the built-in confirmation flow.
   *
   * Preventing the form's `method="dialog"` default preserves the exit animation,
   * pending lock, validation guard, and promise resolution performed by this host.
   */
  @BindEvent({ event: "submit", id: "#dota-alert-form" })
  submitBuiltIn(event: SubmitEvent): void {
    event.preventDefault();
    void this.confirmBuiltIn();
  }

  /**
   * Rechecks the prompt guard after input changes without re-rendering the dialog.
   *
   * This keeps the primary button's enabled state synchronized with the raw field
   * value while preserving focus and the browser's native input behavior.
   */
  @BindEvent({ event: "input", id: "#dota-alert-input" })
  validatePrompt(): void {
    this.applyFieldGuard();
  }

  /**
   * Treats the built-in Cancel button as an explicit safe exit.
   *
   * Explicit exits remain available to a custom or risk dialog even when its
   * backdrop is intentionally not a dismissal surface.
   */
  @BindEvent({ event: "click", id: "#dota-alert-cancel" })
  cancelBuiltIn(): void {
    this.cancelActiveJob("explicit");
  }

  /**
   * Detects a click outside the dialog rectangle after the native dialog retargets it.
   *
   * Only the dismissal policy decides whether that scrim click settles the job;
   * focus trapping and the inert background remain browser responsibilities.
   */
  @HostListener({ event: "click" })
  handleDialogClick(event: MouseEvent): void {
    if (event.target !== this.dialog) {
      return;
    }

    const dialogBounds = this.dialog.getBoundingClientRect();
    const clickedInsideDialog = event.clientX >= dialogBounds.left
      && event.clientX <= dialogBounds.right
      && event.clientY >= dialogBounds.top
      && event.clientY <= dialogBounds.bottom;

    if (!clickedInsideDialog) {
      this.cancelActiveJob("scrim");
    }
  }

  /**
   * Returns the stable native-dialog skeleton used for every request.
   *
   * Runtime methods write request data into these nodes instead of re-rendering,
   * so a visible dialog retains its focus, transition state, and native modal session.
   */
  render(): string {
    return HTML`
      <dialog class="dota-alert__dialog" id="dota-alert-dialog">
        <form class="dota-alert__form" id="dota-alert-form" method="dialog">
          <section class="dota-alert__built-in" id="dota-alert-built-in">
            <div class="dota-alert__body">
              <div class="dota-alert__head">
                <span class="dota-alert__icon" id="dota-alert-icon" aria-hidden="true"></span>
                <div>
                  <h2 class="dota-alert__title" id="dota-alert-title"></h2>
                  <p class="dota-alert__text" id="dota-alert-body"></p>
                </div>
              </div>
              <div class="dota-alert__field" id="dota-alert-field" hidden>
                <div class="dota-alert__field-label">
                  <label class="form-label form-label" for="dota-alert-input" id="dota-alert-label"></label>
                  <span class="dota-alert__hint" id="dota-alert-hint"></span>
                </div>
                <input class="form-control input-md input-rounded-md input-bordered dota-alert__input" id="dota-alert-input" type="text" autocomplete="off" />
              </div>
              <p class="dota-alert__error" id="dota-alert-built-in-error" role="alert" hidden></p>
            </div>
            <footer class="dota-alert__footer">
              <button class="dota-alert__button dota-alert__button--ghost" id="dota-alert-cancel" type="button">Cancel</button>
              <button class="dota-alert__button" id="dota-alert-confirm" type="submit">
                <span class="dota-alert__confirm-label" id="dota-alert-confirm-label">Continue</span>
              </button>
            </footer>
          </section>
        </form>
        <section class="dota-alert__custom" id="dota-alert-custom" hidden>
          <div class="dota-alert__custom-content" id="dota-alert-custom-content"></div>
          <p class="dota-alert__error" id="dota-alert-custom-error" role="alert" hidden></p>
        </section>
      </dialog>
    `;
  }

  /**
   * Serializes a request behind the active dialog or starts it immediately.
   *
   * This is the single admission point for both API paths, ensuring built-in and
   * caller-owned dialogs never appear together.
   */
  private enqueue(job: AlertJob): void {
    if (this.state !== "closed") {
      this.queue.push(job);
      return;
    }

    this.start(job);
  }

  /**
   * Publishes one queued job into the persistent DOM and opens its modal session.
   *
   * Content is prepared before `showModal()` so its role and labels are complete
   * when assistive technology receives the dialog; the next frame then starts enter motion.
   */
  private start(job: AlertJob): void {
    this.activeJob = job;
    this.state = "open";
    this.resetDialog();

    if (job.kind === "built-in") {
      this.renderBuiltIn(job);
    } else {
      this.renderCustom(job);
    }

    this.lockPageScroll();
    this.dialog.showModal();
    this.enterFrame = requestAnimationFrame(() => {
      this.enterFrame = requestAnimationFrame(() => this.dialog.classList.add("is-open"));
    });
    this.focusInitialTarget(job);
  }

  /**
   * Maps a built-in request to the shared form, accessibility contract, and tone treatment.
   *
   * Prompt details remain in this branch because the input belongs only to the
   * pre-built anatomy; custom content mounts through {@link renderCustom} instead.
   */
  private renderBuiltIn(job: BuiltInAlertJob<unknown, unknown>): void {
    const { field, tone } = job.options;
    const hasAsyncConfirmation = typeof job.options.onConfirm === "function";
    const confirmLabel = job.options.confirm ?? (tone === "note" ? "Got it" : "Continue");

    this.dialog.dataset.tone = tone;
    this.dialog.setAttribute("role", field ? "dialog" : "alertdialog");
    this.dialog.setAttribute("aria-labelledby", "dota-alert-title");
    this.dialog.toggleAttribute("aria-describedby", Boolean(job.options.body));
    if (job.options.body) {
      this.dialog.setAttribute("aria-describedby", "dota-alert-body");
    }

    this.icon.innerHTML = GLYPHS[tone];
    this.titleElement.textContent = job.options.title;
    this.body.textContent = job.options.body ?? "";
    this.cancelButton.hidden = tone === "note";
    this.cancelButton.textContent = job.options.cancel ?? "Cancel";
    this.confirmButton.className = hasAsyncConfirmation
      ? `dota-alert__action dota-alert__action--${tone}`
      : `dota-alert__button dota-alert__button--${tone}`;
    this.confirmLabel.textContent = confirmLabel;
    this.confirmButton.disabled = false;
    this.cancelButton.disabled = false;

    this.field.hidden = !field;
    if (!field) {
      this.input.value = "";
      return;
    }

    this.label.textContent = field.label;
    this.hint.textContent = field.hint ?? "";
    this.hint.hidden = !field.hint;
    this.input.value = field.value ?? "";
    this.input.placeholder = field.placeholder ?? "";
    this.applyFieldGuard();
  }

  /**
   * Mounts caller-owned content and binds a controller to this exact queued job.
   *
   * The controller rejects stale calls after the job has settled, preventing an
   * old custom element from resolving whichever alert happens to be visible later.
   */
  private renderCustom(job: CustomAlertJob<unknown>): void {
    const controller: AlertController<unknown> = {
      resolve: (value) => {
        if (this.activeJob === job && this.state === "open") {
          this.settle(value);
        }
      },
      cancel: () => {
        if (this.activeJob === job) {
          this.cancelActiveJob("explicit");
        }
      },
      run: async (action) => this.runCustomAction(job, action),
    };
    const content = typeof job.options.content === "function"
      ? job.options.content(controller)
      : job.options.content;

    this.dialog.removeAttribute("data-tone");
    this.dialog.setAttribute("role", "dialog");
    this.dialog.removeAttribute("aria-labelledby");
    this.dialog.removeAttribute("aria-describedby");
    this.dialog.setAttribute("aria-label", job.options.ariaLabel);
    this.builtInPanel.hidden = true;
    this.customPanel.hidden = false;
    this.customContent.replaceChildren(content);
  }

  /**
   * Applies a prompt guard to the current built-in primary button.
   *
   * It deliberately reads the untrimmed input because callers may enforce an
   * exact string; trimming happens only when a valid prompt settles.
   */
  private applyFieldGuard(): void {
    const job = this.activeJob;
    if (this.state === "pending" || job?.kind !== "built-in" || !job.options.field) {
      return;
    }

    const guard = job.options.field.guard;
    this.confirmButton.disabled = guard ? !guard(this.input.value) : false;
  }

  /**
   * Confirms a built-in request, optionally keeping it open while caller work runs.
   *
   * Rejections restore the controls and surface the error in place so the visitor
   * can revise the same decision rather than reopening a new dialog.
   */
  private async confirmBuiltIn(): Promise<void> {
    const job = this.activeJob;
    if (this.state !== "open" || job?.kind !== "built-in") {
      return;
    }

    const value = job.options.field ? this.input.value.trim() : true;
    if (job.options.field?.guard && !job.options.field.guard(this.input.value)) {
      return;
    }

    if (!job.options.onConfirm) {
      this.settle(value);
      return;
    }

    this.setPending(true, job.options.busy ?? "Working");
    try {
      const result = await job.options.onConfirm(value);
      if (this.activeJob !== job) {
        return;
      }
      this.state = "open";
      this.settle(result === undefined ? value : result);
    } catch (error) {
      if (this.activeJob !== job) {
        return;
      }
      this.setPending(false);
      this.showError(error);
      this.cancelButton.focus({ preventScroll: true });
    }
  }

  /**
   * Runs a caller-owned action under the host's pending state.
   *
   * The active-job check makes a controller safe to retain: a late promise from
   * an old custom element cannot close or modify a later queued dialog.
   */
  private async runCustomAction(job: CustomAlertJob<unknown>, action: () => unknown | Promise<unknown>): Promise<void> {
    if (this.state !== "open" || this.activeJob !== job) {
      return;
    }

    this.setPending(true);
    try {
      const result = await action();
      if (this.activeJob !== job) {
        return;
      }
      this.state = "open";
      this.settle(result);
    } catch (error) {
      if (this.activeJob !== job) {
        return;
      }
      this.setPending(false);
      this.showError(error);
      this.firstFocusableCustomControl()?.focus({ preventScroll: true });
    }
  }

  /**
   * Switches the machine between open and pending, then reflects that state in the built-in form.
   *
   * Custom content owns its own visual controls, while the host still blocks
   * cancellation and duplicate controller actions through the shared state.
   */
  private setPending(isPending: boolean, busyLabel?: string): void {
    this.state = isPending ? "pending" : "open";
    this.dialog.toggleAttribute("data-pending", isPending);

    if (this.activeJob?.kind !== "built-in") {
      return;
    }

    this.confirmButton.disabled = isPending;
    this.cancelButton.disabled = isPending;
    this.input.disabled = isPending;
    this.confirmButton.toggleAttribute("data-state", isPending);
    if (isPending) {
      this.confirmLabel.textContent = busyLabel ?? "Working";
      this.confirmButton.insertAdjacentHTML("afterbegin", `<span class="dota-alert__spinner" aria-hidden="true"></span>`);
      return;
    }

    this.confirmButton.querySelector(".dota-alert__spinner")?.remove();
    this.confirmLabel.textContent = this.activeJob.options.confirm
      ?? (this.activeJob.options.tone === "note" ? "Got it" : "Continue");
    this.applyFieldGuard();
  }

  /**
   * Intercepts native Escape cancellation before the browser closes the dialog directly.
   *
   * Routing Escape through the normal cancellation path preserves the exit transition
   * and lets pending work or custom dismissal policy refuse the request.
   */
  private handleNativeCancel(event: Event): void {
    event.preventDefault();
    this.cancelActiveJob("escape");
  }

  /**
   * Applies the active job's dismissal policy for an explicit control, Escape, or scrim click.
   *
   * Risk dialogs reject only scrim clicks; custom dialogs may reject non-explicit
   * exits. Pending and closing jobs reject every path before this policy runs.
   */
  private cancelActiveJob(source: "explicit" | "escape" | "scrim"): void {
    if (!this.activeJob || this.state !== "open") {
      return;
    }

    if (source === "scrim" && this.activeJob.kind === "built-in" && this.activeJob.options.tone === "risk") {
      return;
    }

    if (source !== "explicit" && this.activeJob.kind === "custom" && this.activeJob.options.dismissible === false) {
      return;
    }

    this.settle(this.cancelValue(this.activeJob));
  }

  /**
   * Begins the shared exit sequence and resolves the job only after the dialog has closed.
   *
   * Delaying queue drainage until `close()` preserves native focus return and
   * guarantees that a queued dialog never overlaps the departing one.
   */
  private settle(value: unknown): void {
    if (!this.activeJob || this.state === "closing" || this.state === "closed") {
      return;
    }

    const completedJob = this.activeJob;
    this.state = "closing";
    this.dialog.classList.remove("is-open");
    this.dialog.removeAttribute("data-pending");
    const finish = (): void => {
      this.dialog.close();
      this.unlockPageScroll();
      this.activeJob = null;
      this.state = "closed";
      completedJob.resolve(value as never);
      const nextJob = this.queue.shift();
      if (nextJob) {
        this.start(nextJob);
      }
    };

    if (this.prefersReducedMotion()) {
      finish();
      return;
    }

    this.closeTimer = window.setTimeout(finish, 190);
  }

  /**
   * Restores the persistent DOM to a neutral state before the next job writes into it.
   *
   * This removes mounted custom content, async errors, and stateful button pieces
   * that must never leak from one queued request into another.
   */
  private resetDialog(): void {
    this.builtInPanel.hidden = false;
    this.customPanel.hidden = true;
    this.customContent.replaceChildren();
    this.builtInError.hidden = true;
    this.builtInError.textContent = "";
    this.customError.hidden = true;
    this.customError.textContent = "";
    this.input.disabled = false;
    this.confirmButton.querySelector(".dota-alert__spinner")?.remove();
    this.dialog.removeAttribute("aria-label");
    this.dialog.classList.remove("is-open");
  }

  /**
   * Chooses the initial focus target after the dialog enters the native top layer.
   *
   * Prompts prioritize their field, destructive dialogs prioritize Cancel, and
   * custom content receives its first usable control; the short delay avoids scrolling.
   */
  private focusInitialTarget(job: AlertJob): void {
    const target = job.kind === "custom"
      ? this.firstFocusableCustomControl()
      : job.options.field
        ? this.input
        : job.options.tone === "risk"
          ? this.cancelButton
          : this.confirmButton;

    this.focusTimer = window.setTimeout(() => target?.focus({ preventScroll: true }), this.prefersReducedMotion() ? 0 : 40);
  }

  /**
   * Finds the first enabled keyboard target inside caller-owned content.
   *
   * Both initial custom focus and async-error recovery use the same ordering, so
   * custom elements do not need to know about the surrounding dialog structure.
   */
  private firstFocusableCustomControl(): HTMLElement | null {
    return this.customContent.querySelector<HTMLElement>("button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])");
  }

  /**
   * Displays an async failure in the active panel's live region.
   *
   * Errors remain deliberately generic unless a caller threw an `Error` with a
   * message, avoiding accidental rendering of arbitrary rejected values.
   */
  private showError(error: unknown): void {
    const message = error instanceof Error && error.message ? error.message : "That did not work. Try again.";
    const errorElement = this.activeJob?.kind === "custom" ? this.customError : this.builtInError;
    errorElement.textContent = message;
    errorElement.hidden = false;
  }

  /**
   * Returns the cancellation result promised by the active API shape.
   *
   * Built-in prompts mirror `window.prompt()` with `null`; other built-ins use
   * `false`, while a custom request owns the value its surrounding flow needs.
   */
  private cancelValue(job: AlertJob): false | null | unknown {
    if (job.kind === "custom") {
      return job.options.cancelValue;
    }

    return job.options.field ? null : false;
  }

  /**
   * Locks page scrolling for the native modal while preserving the current content width.
   *
   * Saving and compensating the inline-end padding prevents the scrollbar from
   * shifting the page behind the scrim when the dialog opens.
   */
  private lockPageScroll(): void {
    const documentRoot = document.documentElement;
    this.savedPaddingInlineEnd = documentRoot.style.paddingInlineEnd;
    const scrollbarWidth = window.innerWidth - documentRoot.clientWidth;
    if (scrollbarWidth > 0) {
      documentRoot.style.paddingInlineEnd = `${scrollbarWidth}px`;
    }
    documentRoot.classList.add("dota-alert-lock");
  }

  /**
   * Restores the document styles captured when the current modal opened.
   *
   * This is paired with {@link lockPageScroll} and runs only after the native
   * dialog closes, so queued requests start from the page's normal geometry.
   */
  private unlockPageScroll(): void {
    const documentRoot = document.documentElement;
    documentRoot.classList.remove("dota-alert-lock");
    documentRoot.style.paddingInlineEnd = this.savedPaddingInlineEnd;
  }

  /**
   * Cancels retained animation and focus work during component teardown.
   *
   * Each handle is cleared independently because the component can disconnect
   * while entering, waiting to focus, or completing its exit transition.
   */
  private cancelScheduledWork(): void {
    if (this.enterFrame !== null) {
      cancelAnimationFrame(this.enterFrame);
      this.enterFrame = null;
    }
    if (this.focusTimer !== null) {
      window.clearTimeout(this.focusTimer);
      this.focusTimer = null;
    }
    if (this.closeTimer !== null) {
      window.clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }

  /**
   * Reads the current reduced-motion preference at the moment motion is scheduled.
   *
   * Exit and focus timing use this value so a dialog never waits for a transform
   * transition that the reduced-motion stylesheet intentionally removes.
   */
  private prefersReducedMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
}

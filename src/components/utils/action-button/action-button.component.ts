import { ApplicationEventService, BaseElement, BindEvent, Component, HTML, Property, String } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent, type ApplicationEvent } from "@ayu-sh-kr/dota-wrap/event";
import {
  ACTION_BUTTON_REFRESH_EVENT,
  ACTION_BUTTON_REJECT_EVENT,
  ACTION_BUTTON_RESOLVE_EVENT,
  ACTION_BUTTON_TRIGGER_EVENT,
  type ActionButtonState,
  type ActionButtonTrigger,
  type ActionButtonVariant,
} from "@app/events/action-button.events.ts";
import { actionButtonRegistry } from "@app/service/action-button-registry.service.ts";

/** Milliseconds each terminal state remains visible before the button becomes available again. */
const SETTLE_DELAY: Record<Extract<ActionButtonState, "success" | "error">, number> = {
  success: 2_200,
  error: 2_600,
};

/**
 * Renders the lifecycle of one named asynchronous action.
 *
 * It is used by feature forms such as blog subscription and by standalone actions such as
 * offline retry. On click it validates and captures the closest form, then publishes
 * {@link ACTION_BUTTON_TRIGGER_EVENT}. The dispatcher runs the feature-owned handler and
 * returns a resolve or reject event; this component only reflects those events in its native
 * `<button>`. It therefore never imports an endpoint or owns business work.
 *
 * Selector: `action-button`.
 */
@Component({ selector: "action-button", shadow: false })
export class ActionButtonComponent extends BaseElement {
  /** Sends this renderer's typed trigger to the bootstrap-registered action dispatcher. */
  private readonly publisher = ApplicationEventService.getInstance().getPublisher();

  /** Attribute `action`; required stable registry name, such as `subscription.submit`; an empty value disables the button. */
  @Property({ name: "action", type: String })
  action = "";

  /** Attribute `variant`; accepts `accent`, `ink`, `ghost`, or `danger`; defaults to `ink` and changes color only. */
  @Property({ name: "variant", type: String })
  variant: ActionButtonVariant = "ink";

  /** Attribute `guard`; optional registered prerequisite name; an unknown or failing guard disables idle interaction. */
  @Property({ name: "guard", type: String })
  guard = "";

  /** Attribute `label`; idle action text, defaulting to `Continue`; changing it updates the label after the next render. */
  @Property({ name: "label", type: String })
  label = "Continue";

  /** Attribute `busy-label`; pending text, defaulting to `Working…`, shown while the dispatcher owns the request. */
  @Property({ name: "busy-label", type: String })
  busyLabel = "Working…";

  /** Attribute `done-label`; success text, defaulting to `Done`, announced before the 2.2-second reset. */
  @Property({ name: "done-label", type: String })
  doneLabel = "Done";

  /** Attribute `fail-label`; failure text, defaulting to `Try again`, announced before the 2.6-second reset. */
  @Property({ name: "fail-label", type: String })
  failLabel = "Try again";

  /** Current bus-driven lifecycle, reflected through `data-state` for styling and accessibility. */
  private state: ActionButtonState = "idle";

  /** Terminal-state reset retained so it can be cancelled if a component is disconnected or re-settled. */
  private settleTimer: number | null = null;

  /** Creates the renderer; page-specific work is supplied later through the action-handler registry. */
  constructor() {
    super();
  }

  /** Clears an outstanding settle timer when route teardown removes the renderer before it returns to idle. */
  @OnEvent("disconnected", true)
  onDisconnected(): void {
    this.clearSettleTimer();
  }

  /** Listens for {@link ACTION_BUTTON_TRIGGER_EVENT} and enters pending only when its standard `id` matches this host. */
  @OnEvent(ACTION_BUTTON_TRIGGER_EVENT)
  onTrigger(event: ApplicationEvent<typeof ACTION_BUTTON_TRIGGER_EVENT>): void {
    if (event.data.id === this.id) {
      this.setState("pending");
    }
  }

  /** Listens for the dispatcher's resolve event and exposes a brief success acknowledgement for this button only. */
  @OnEvent(ACTION_BUTTON_RESOLVE_EVENT)
  onResolve(event: ApplicationEvent<typeof ACTION_BUTTON_RESOLVE_EVENT>): void {
    if (event.data.id === this.id) {
      this.setState("success");
    }
  }

  /** Listens for rejection, including dispatcher timeout, and exposes the configured retry label for this button only. */
  @OnEvent(ACTION_BUTTON_REJECT_EVENT)
  onReject(event: ApplicationEvent<typeof ACTION_BUTTON_REJECT_EVENT>): void {
    if (event.data.id === this.id) {
      this.setState("error");
    }
  }

  /** Re-evaluates an idle guard after its owning feature publishes {@link ACTION_BUTTON_REFRESH_EVENT}. */
  @OnEvent(ACTION_BUTTON_REFRESH_EVENT)
  onRefresh(event: ApplicationEvent<typeof ACTION_BUTTON_REFRESH_EVENT>): void {
    if (this.state === "idle" && (!event.data.guard || event.data.guard === this.guard)) {
      this.updateHTML();
    }
  }

  /**
   * Validates the closest form and asks the application dispatcher to begin the named action.
   *
   * The host's standard `id` is the settlement address and must therefore be unique per page.
   * The pending state is set by this button's subscription to the resulting trigger event;
   * work itself remains in the registered handler.
   */
  @BindEvent({ event: "click", id: "[data-action-button]" })
  trigger(event: MouseEvent): void {
    event.preventDefault();
    const form = this.closest("form");
    if (this.isDisabled() || (form instanceof HTMLFormElement && !form.reportValidity())) {
      return;
    }

    void this.publisher.publishAsync({
      name: ACTION_BUTTON_TRIGGER_EVENT,
      data: {
        action: this.action,
        id: this.id,
        payload: form instanceof HTMLFormElement ? Object.fromEntries(new FormData(form).entries()) : {},
      } satisfies ActionButtonTrigger,
    });
  }

  /** Renders one native button; variants change only tone while lifecycle changes label, glyph, and disabled state. */
  render(): string {
    const state = this.state;
    const disabled = this.isDisabled();
    const label = this.labelForState();
    return HTML`
      <button
        class="action-button action-button--${this.safeVariant()}"
        type="button"
        data-action-button
        data-state="${state}"
        aria-busy="${state === "pending" ? "true" : "false"}"
        aria-disabled="${disabled ? "true" : "false"}"
        ${disabled ? "disabled" : ""}
      >
        <span class="action-button__glyph" aria-hidden="true">${this.glyphForState()}</span>
        <span class="action-button__label">${label}</span>
      </button>
      <span class="sr-only" aria-live="polite">${state === "idle" ? "" : label}</span>
    `;
  }

  /** Moves to the received lifecycle state, re-renders its accessible output, and schedules a terminal reset when needed. */
  private setState(state: ActionButtonState): void {
    this.clearSettleTimer();
    this.state = state;
    this.updateHTML();

    if (state === "success" || state === "error") {
      this.settleTimer = window.setTimeout(() => this.setState("idle"), SETTLE_DELAY[state]);
    }
  }

  /** Combines lifecycle, host locks, required identity, and guard evaluation into the native disabled state. */
  private isDisabled(): boolean {
    return this.state !== "idle"
      || !this.action
      || !this.id
      || this.hasAttribute("disabled")
      || this.hasAttribute("data-locked")
      || (this.guard.length > 0 && !actionButtonRegistry.passesGuard(this.guard));
  }

  /** Falls back malformed markup to `ink`, keeping externally authored variants inside the supported design grammar. */
  private safeVariant(): ActionButtonVariant {
    return ["accent", "ink", "ghost", "danger"].includes(this.variant) ? this.variant : "ink";
  }

  /** Selects the transient lifecycle label without overwriting the idle copy configured by the owning feature. */
  private labelForState(): string {
    if (this.state === "pending") {
      return this.busyLabel;
    }
    if (this.state === "success") {
      return this.doneLabel;
    }
    if (this.state === "error") {
      return this.failLabel;
    }
    return this.label;
  }

  /** Adds a compact non-color state signal so success and failure remain distinguishable beyond variant color. */
  private glyphForState(): string {
    if (this.state === "pending") {
      return HTML`<span class="action-button__spinner"></span>`;
    }
    if (this.state === "success") {
      return "✓";
    }
    if (this.state === "error") {
      return "!";
    }
    return "→";
  }

  /** Cancels the previous terminal reset before a new event starts a fresh lifecycle window. */
  private clearSettleTimer(): void {
    if (this.settleTimer !== null) {
      window.clearTimeout(this.settleTimer);
      this.settleTimer = null;
    }
  }
}

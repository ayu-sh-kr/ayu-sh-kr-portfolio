import { BaseElement, BeforeInit, Component, HTML, HostListener, Property, String } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { ServiceState, type ServiceCapabilityState, type ServiceStatus } from "@app/service/service-state.service.ts";

const COPY: Record<Exclude<ServiceCapabilityState, "up">, { kind: string; message: string; supporting: string }> = {
  planned: {
    kind: "Paused",
    message: "This capability is paused for a short window.",
    supporting: "Everything else on the site is unaffected.",
  },
  down: {
    kind: "Not reaching the server",
    message: "This capability is not getting through to the server right now.",
    supporting: "There is no reliable return time to publish yet.",
  },
};

/**
 * Owns one capability's maintenance row while preserving the caller's live
 * markup. Put the working form inside the element and mark its submit control
 * with `data-service-submit`; JavaScript-disabled visitors see that content.
 */
@Component({ selector: "service-state", shadow: false })
export class ServiceStateComponent extends BaseElement {
  @Property({ name: "capability", type: String })
  capability = "";

  @Property({ name: "label", type: String })
  label = "this capability";

  @Property({ name: "email", type: String })
  email = "hello@ayush.dev";

  private content = "";
  private dirty = false;
  private firstState = true;
  private currentState: ServiceStatus = { state: "up", until: null, note: null };
  private removeObserver: (() => void) | null = null;

  constructor() {
    super();
  }

  @BeforeInit()
  captureLiveContent(): void {
    this.content = this.innerHTML.trim();
  }

  @OnEvent("connected", true)
  onConnected(): void {
    this.removeObserver = ServiceState.observe(this.capability, (status) => this.reflect(status));
  }

  @OnEvent("disconnected", true)
  onDisconnected(): void {
    this.removeObserver?.();
    this.removeObserver = null;
  }

  @HostListener({ event: "input" })
  onInput(): void {
    this.dirty = true;
    this.reflect(this.currentState);
  }

  render(): string {
    return HTML`
      <div class="service-state__notice" data-service-notice role="status" aria-live="off">
        <div class="service-state__heading">
          <span class="service-state__mark" aria-hidden="true"></span>
          <span class="service-state__kind" data-service-kind>Paused</span>
        </div>
        <p class="service-state__message" data-service-message></p>
        <p class="service-state__supporting" data-service-supporting></p>
        <div class="service-state__out">
          <a data-service-route href="mailto:${this.email}">Send it by email instead</a>
          <span data-service-until></span>
        </div>
      </div>
      <div class="service-state__live" data-service-live>${this.content}</div>
    `;
  }

  private reflect(status: ServiceStatus): void {
    this.currentState = status;
    const isDegraded = status.state !== "up";
    const render = !isDegraded ? "live" : this.dirty ? "both" : "notice";
    const notice = this.querySelector<HTMLElement>("[data-service-notice]");
    if (!notice) {
      return;
    }

    const hadFocus = this.contains(document.activeElement);
    this.dataset.state = status.state;
    this.dataset.render = render;

    if (isDegraded) {
      const copy = COPY[status.state as Exclude<ServiceCapabilityState, "up">];
      this.querySelector<HTMLElement>("[data-service-kind]")!.textContent = copy.kind;
      const message = status.state === "planned" && status.note ? `${status.note}.` : copy.message;
      this.querySelector<HTMLElement>("[data-service-message]")!.textContent = `${this.label} ${message}`;
      this.querySelector<HTMLElement>("[data-service-supporting]")!.textContent = copy.supporting;
      this.updateUntil(status);
      const route = this.querySelector<HTMLAnchorElement>("[data-service-route]")!;
      route.href = this.mailto();
      route.textContent = this.dirty ? "Take what you have written to email" : "Send it by email instead";
      const changedState = this.firstState || status.state !== this.previousState;
      notice.setAttribute("aria-live", changedState && !this.firstState ? "polite" : "off");
      if (changedState && !this.firstState) {
        queueMicrotask(() => notice.setAttribute("aria-live", "off"));
      }
      if (!this.firstState && hadFocus && render === "notice") {
        notice.tabIndex = -1;
        notice.focus();
      }
    }

    this.previousState = status.state;
    this.firstState = false;
  }

  private previousState: ServiceCapabilityState = "up";

  private updateUntil(status: ServiceStatus): void {
    const target = this.querySelector<HTMLElement>("[data-service-until]")!;
    target.replaceChildren();
    if (status.state !== "planned" || !status.until) {
      return;
    }
    const date = new Date(status.until);
    if (Number.isNaN(date.valueOf())) {
      return;
    }
    const time = document.createElement("time");
    time.className = "service-state__time";
    time.dateTime = status.until;
    time.textContent = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    target.append("Back around ", time, " your time");
  }

  private mailto(): string {
    const fields = this.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[data-service-live] input, [data-service-live] textarea");
    const lines = [...fields]
      .filter((field) => field.value.trim())
      .map((field) => `${field.labels?.[0]?.textContent ?? field.name}: ${field.value.trim()}`);
    const subject = encodeURIComponent(`${this.label} was unavailable`);
    const body = lines.length ? `&body=${encodeURIComponent(lines.join("\n\n"))}` : "";
    return `mailto:${this.email}?subject=${subject}${body}`;
  }
}

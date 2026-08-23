import { BaseElement, Component, HTML, Property, String } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { ServiceState, type ServiceStatus } from "@app/service/service-state.service.ts";

const DEFAULT_CAPABILITIES = "subscribe,quote,coffee,unsubscribe";
const LABELS: Record<string, string> = {
  subscribe: "the newsletter signup",
  quote: "the project form",
  coffee: "the coffee page",
  unsubscribe: "unsubscribing",
};

/** Optional fixed-chrome summary for pages that need discoverable degraded state. */
@Component({ selector: "service-state-strip", shadow: false })
export class ServiceStateStripComponent extends BaseElement {
  @Property({ name: "capabilities", type: String })
  capabilities = DEFAULT_CAPABILITIES;

  @Property({ name: "label", type: String })
  label = "";

  private removeObservers: (() => void)[] = [];
  private statuses = new Map<string, ServiceStatus>();
  private firstRender = true;

  constructor() {
    super();
  }

  @OnEvent("connected", true)
  onConnected(): void {
    this.removeObservers = this.names().map((name) => ServiceState.observe(name, (status) => {
      this.statuses.set(name, status);
      this.updateStrip();
    }));
  }

  @OnEvent("disconnected", true)
  onDisconnected(): void {
    this.removeObservers.forEach((remove) => remove());
    this.removeObservers = [];
    document.documentElement.classList.remove("has-service-state-strip");
  }

  render(): string {
    return HTML`
      <div class="service-state-strip" role="status" aria-live="off" hidden>
        <div class="service-state-strip__inner layout-page">
          <span class="service-state__mark" aria-hidden="true"></span>
          <p data-service-strip-message></p>
          <a href="#service-state-scope">What is affected</a>
        </div>
      </div>
    `;
  }

  private names(): string[] {
    return this.capabilities.split(",").map((name) => name.trim()).filter(Boolean);
  }

  private updateStrip(): void {
    const strip = this.querySelector<HTMLElement>(".service-state-strip");
    const message = this.querySelector<HTMLElement>("[data-service-strip-message]");
    if (!strip || !message) return;

    const degraded = this.names().map((name) => ({ name, ...this.statuses.get(name) ?? ServiceState.get(name) }))
      .filter(({ state }) => state !== "up");
    if (!degraded.length) {
      strip.hidden = true;
      document.documentElement.classList.remove("has-service-state-strip");
      this.firstRender = false;
      return;
    }

    const worst = degraded.some(({ state }) => state === "down") ? "down" : "planned";
    strip.dataset.worst = worst;
    message.textContent = degraded.length > 1
      ? `${degraded.length} things are unavailable right now. The rest of the site is unaffected.`
      : this.singleMessage(degraded[0]);
    strip.setAttribute("aria-live", this.firstRender ? "off" : "polite");
    strip.hidden = false;
    document.documentElement.classList.add("has-service-state-strip");
    this.firstRender = false;
  }

  private singleMessage(status: { name: string; state: string; until: string | null }): string {
    const label = this.label || LABELS[status.name] || status.name;
    if (status.state === "planned" && status.until) {
      const date = new Date(status.until);
      if (!Number.isNaN(date.valueOf())) {
        return `Paused: ${label}, back around ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} your time.`;
      }
    }
    return status.state === "planned" ? `Paused: ${label}.` : `${label[0].toUpperCase()}${label.slice(1)} is not reaching the server.`;
  }
}

export type ServiceCapabilityState = "up" | "planned" | "down";

export interface ServiceStatus {
  state: ServiceCapabilityState;
  until: string | null;
  note: string | null;
}

export interface ServiceStateCadence {
  idle: number;
  degraded: number;
}

export type ServiceStatusDriver = () => unknown | Promise<unknown>;
export type ServiceStateObserver = (status: ServiceStatus) => void;

const DEFAULT_STATUS: ServiceStatus = { state: "up", until: null, note: null };
const VALID_STATES = new Set<ServiceCapabilityState>(["up", "planned", "down"]);

function copyStatus(status: ServiceStatus): ServiceStatus {
  return { ...status };
}

/**
 * Headless service-state machine shared by service-state UI elements.
 *
 * It reads the static `/status.json` document, fails open when that document
 * cannot be trusted, rejects stale poll responses, and publishes passive
 * observations to UI consumers. `forceTrigger` is the explicit seam for
 * demos, tests, and an operator-owned status control.
 */
export class ServiceStateService {
  private readonly states = new Map<string, ServiceStatus>();
  private readonly forcedStates = new Map<string, ServiceStatus>();
  private readonly observers = new Map<string, Set<ServiceStateObserver>>();
  private statusDriver: ServiceStatusDriver = () => this.readStatusDocument();
  private cadence: ServiceStateCadence = { idle: 300_000, degraded: 30_000 };
  private timer: number | null = null;
  private requestSequence = 0;
  private started = false;
  private readonly handleVisibility = (): void => {
    if (document.visibilityState === "visible") {
      void this.poll();
    }
  };
  private readonly handleOnline = (): void => {
    void this.poll();
  };

  /** Replaces the status reader, primarily for tests and local demos. */
  driver(driver: ServiceStatusDriver): this {
    this.statusDriver = driver;
    return this;
  }

  /** Explicit name for callers that prefer setter-style APIs. */
  setDriver(driver: ServiceStatusDriver): this {
    return this.driver(driver);
  }

  /** Starts automatic detection and its visibility/online rechecks once. */
  start(cadence?: Partial<ServiceStateCadence>): this {
    this.cadence = { ...this.cadence, ...cadence };
    if (this.started || typeof window === "undefined") {
      return this;
    }

    this.started = true;
    document.addEventListener("visibilitychange", this.handleVisibility);
    window.addEventListener("online", this.handleOnline);
    void this.poll();
    return this;
  }

  /** Stops polling and removes global listeners; useful for isolated tests. */
  stop(): void {
    if (!this.started || typeof window === "undefined") {
      return;
    }

    this.started = false;
    document.removeEventListener("visibilitychange", this.handleVisibility);
    window.removeEventListener("online", this.handleOnline);
    this.clearTimer();
    this.requestSequence += 1;
  }

  /** Reads one capability without creating a subscription. */
  get(name: string): ServiceStatus {
    return copyStatus(this.states.get(name) ?? DEFAULT_STATUS);
  }

  /** Subscribes passively and immediately receives the current state. */
  observe(name: string, observer: ServiceStateObserver): () => void {
    const observers = this.observers.get(name) ?? new Set<ServiceStateObserver>();
    observers.add(observer);
    this.observers.set(name, observers);
    observer(this.get(name));

    return () => {
      observers.delete(observer);
      if (!observers.size) {
        this.observers.delete(name);
      }
    };
  }

  /** Forces a capability state without a status-document round trip. */
  forceTrigger(name: string, patch: Partial<ServiceStatus>): void {
    const status = this.normaliseCapability(patch);
    this.forcedStates.set(name, status);
    this.apply(new Map([[name, status]]));
    this.schedule();
  }

  /** Removes an explicit override so the next status-document poll owns the capability again. */
  clearForceTrigger(name: string): void {
    this.forcedStates.delete(name);
    this.apply(new Map([[name, DEFAULT_STATUS]]));
    this.schedule();
  }

  /** Alias retained for the concise demo/test seam. */
  push(name: string, patch: Partial<ServiceStatus>): void {
    this.forceTrigger(name, patch);
  }

  private async poll(): Promise<void> {
    const sequence = ++this.requestSequence;
    let raw: unknown = null;
    try {
      raw = await this.statusDriver();
    } catch {
      raw = null;
    }

    if (sequence !== this.requestSequence) {
      return;
    }

    const next = this.normaliseDocument(raw);
    this.forcedStates.forEach((status, name) => next.set(name, status));
    this.apply(next);
    this.schedule();
  }

  private async readStatusDocument(): Promise<unknown> {
    const response = await fetch("/status.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Status document returned ${response.status}`);
    }
    return response.json();
  }

  private normaliseDocument(raw: unknown): Map<string, ServiceStatus> {
    if (!raw || typeof raw !== "object" || !("capabilities" in raw)) {
      return new Map();
    }

    const capabilities = raw.capabilities;
    if (!capabilities || typeof capabilities !== "object") {
      return new Map();
    }

    const next = new Map<string, ServiceStatus>();
    for (const [name, value] of Object.entries(capabilities)) {
      next.set(name, this.normaliseCapability(value));
    }
    return next;
  }

  private normaliseCapability(value: unknown): ServiceStatus {
    const capability = value && typeof value === "object" ? value as Record<string, unknown> : {};
    const state = typeof capability.state === "string" && VALID_STATES.has(capability.state as ServiceCapabilityState)
      ? capability.state as ServiceCapabilityState
      : "up";
    return {
      state,
      until: state === "planned" && typeof capability.until === "string" ? capability.until : null,
      note: typeof capability.note === "string" && capability.note.trim() ? capability.note.trim() : null,
    };
  }

  private apply(next: Map<string, ServiceStatus>): void {
    const names = new Set([...this.states.keys(), ...next.keys(), ...this.observers.keys()]);
    for (const name of names) {
      const before = this.get(name);
      const after = copyStatus(next.get(name) ?? DEFAULT_STATUS);
      this.states.set(name, after);
      if (before.state !== after.state || before.until !== after.until || before.note !== after.note) {
        this.observers.get(name)?.forEach((observer) => {
          try {
            observer(copyStatus(after));
          } catch (error) {
            console.error(error);
          }
        });
      }
    }
  }

  private schedule(): void {
    if (!this.started) {
      return;
    }
    this.clearTimer();
    const hasDegradedCapability = [...this.states.values()].some(({ state }) => state !== "up");
    this.timer = window.setTimeout(() => void this.poll(), hasDegradedCapability ? this.cadence.degraded : this.cadence.idle);
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

/** Application-wide service-state machine. */
export const ServiceState = new ServiceStateService();

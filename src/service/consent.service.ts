import {AppStorage} from "@app/service/storage.service.ts";

/** Presentation mode selected by the application for the consent surface. */
export type ConsentMode = "notice" | "consent";

/** Stored answer values understood by the consent machine. */
export type ConsentChoice = "ack" | "essential" | "all";

/** Lifecycle phase exposed to views so they can distinguish first boot from a completed answer. */
export type ConsentPhase = "unknown" | "shown" | "settled" | "dormant";

/**
 * Snapshot delivered to consent views through {@link Consent.observe}.
 *
 * `shown` means the current visitor still needs to answer, `settled` means the
 * answer happened during this page lifetime, and `dormant` means a versioned
 * answer was already present when the service booted. Keeping the latter two
 * phases separate prevents views or analytics from treating a returning visit
 * as a new decision.
 */
export interface ConsentState {
  /** Current rendering phase of the state machine. */
  phase: ConsentPhase;
  /** Mode that determines which actions the notice presents. */
  mode: ConsentMode;
  /** Answer associated with the current phase, or `null` while unresolved. */
  choice: ConsentChoice | null;
  /** Schema version used to decide whether a stored record is still valid. */
  version: number;
}

interface ConsentRecord {
  /** Choice saved by the visitor for this storage schema. */
  choice: ConsentChoice;
  /** Unix timestamp in milliseconds when the choice was saved. */
  at: number;
}

const STORAGE_NAMESPACE = "ayu-sh-kr.com";
const STORAGE_KEY = "notice";
const STORAGE_VERSION = 1;
const VALID_CHOICES: readonly ConsentChoice[] = ["ack", "essential", "all"];
const consentStorage = AppStorage.scope(STORAGE_NAMESPACE);

/**
 * Owns the consent decision, versioned persistence, and subscriber snapshots.
 *
 * The consent notice is a view of this service: it calls `boot()` once, uses
 * `observe()` for immediate and subsequent snapshots, and sends button choices
 * to `decide()`. Persistence is delegated to the shared {@link AppStorage}
 * namespace so consent and other preferences use one guarded storage boundary.
 */
class ConsentService {
  private readonly subscribers = new Set<(state: ConsentState) => void>();
  private current: ConsentState = {
    phase: "unknown",
    mode: "notice",
    choice: null,
    version: STORAGE_VERSION,
  };

  /**
   * Subscribes a view and immediately gives it a defensive state snapshot.
   *
   * The returned function removes only this subscriber. Views should call it
   * during their disconnected lifecycle so a route teardown cannot retain DOM.
   */
  observe(subscriber: (state: ConsentState) => void): () => void {
    this.subscribers.add(subscriber);
    subscriber(this.state);
    return () => this.subscribers.delete(subscriber);
  }

  /**
   * Returns a copy of the current state so callers can inspect it without
   * mutating the machine's live snapshot.
   */
  get state(): ConsentState {
    return {...this.current};
  }

  /**
   * Resolves the current mode and persisted record at application startup.
   *
   * A valid record produces `dormant`; an absent or outdated record produces
   * `shown`. Both outcomes are published so the notice can settle before the
   * prerendered markup becomes visible.
   */
  boot(mode: ConsentMode): void {
    this.current.mode = mode;
    const priorChoice = this.readDecision();
    this.current.phase = priorChoice ? "dormant" : "shown";
    this.current.choice = priorChoice;
    this.publish();
  }

  /**
   * Reopens the notice in a new mode and clears any transient choice so the
   * view never renders a mode with an incompatible answer.
   */
  setMode(mode: ConsentMode): void {
    if (mode === this.current.mode && this.current.phase === "shown") {
      return;
    }

    this.current = {...this.current, mode, phase: "shown", choice: null};
    this.publish();
  }

  /**
   * Persists a visitor choice and publishes `settled` so subscribers can close
   * immediately while the record remains available on later page loads.
   */
  decide(choice: ConsentChoice): void {
    if (this.current.phase !== "shown") {
      return;
    }

    this.current = {...this.current, phase: "settled", choice};
    consentStorage.set<ConsentRecord>(STORAGE_KEY, {choice, at: Date.now()}, {version: STORAGE_VERSION});
    this.publish();
  }

  /**
   * Clears the versioned answer from shared storage and returns the machine to
   * its unresolved phase for the next view update.
   */
  reset(): void {
    consentStorage.remove(STORAGE_KEY);
    this.current = {...this.current, phase: "unknown", choice: null};
    this.publish();
  }

  /**
   * Reads the current storage envelope and validates its schema and choice
   * through the shared storage service.
   */
  private readDecision(): ConsentChoice | null {
    const record = consentStorage.get<ConsentRecord>(STORAGE_KEY, {version: STORAGE_VERSION});
    if (!record || !VALID_CHOICES.includes(record.choice)) {
      return null;
    }

    return record.choice;
  }

  /**
   * Publishes one defensive snapshot to every current view subscriber so all
   * views observe the same state transition.
   */
  private publish(): void {
    const snapshot = this.state;
    this.subscribers.forEach((subscriber) => subscriber(snapshot));
  }
}

/** Shared consent state machine used by the persistent notice and future consent-aware views. */
export const Consent = new ConsentService();

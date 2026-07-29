import { BaseElement, Component, DocumentListener, HostListener, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import {
  Toast,
  type ToastHost,
  type ToastOptions,
  type ToastPosition,
  type ToastPromiseOptions,
  type ToastTone,
} from "@app/service/toast.service.ts";

/** Live DOM state owned by the single toast rail. */
interface ToastRecord {
  /** Stable public identity used for coalescing and explicit dismissal. */
  id: string;
  /** Current outcome that selects the fill and closing glyph treatment. */
  tone: ToastTone;
  /** Current line of visitor-facing copy, retained for in-place transitions. */
  message: string;
  /** Stable pill node that survives pending and action transitions. */
  element: HTMLElement;
  /** Fill node whose custom property renders the remaining time. */
  fill: HTMLElement;
  /** Message node updated without recreating a focused toast. */
  messageElement: HTMLElement;
  /** Repeat counter shown after an ID is coalesced. */
  countElement: HTMLElement;
  /** Circle used only during the arrival and natural-expiry thresholds. */
  glyph: HTMLElement;
  /** Inner node that receives the appropriate trusted SVG glyph. */
  glyphIcon: HTMLElement;
  /** Total countdown duration in milliseconds for this settled state. */
  duration: number;
  /** Milliseconds left when the shared animation clock last advanced. */
  remaining: number;
  /** Number of equivalent notifications coalesced into this record. */
  count: number;
  /** Whether a caller requested an explicit dismissal-only notification. */
  sticky: boolean;
  /** Whether async work is unresolved and its sweep should remain visible. */
  pending: boolean;
  /** Prevents time from advancing until the entrance animation has settled. */
  armed: boolean;
  /** Pauses time while a pointer drag is deciding whether to dismiss. */
  held: boolean;
  /** Prevents duplicate exit sequences after an expiry or dismissal begins. */
  closing: boolean;
  /** Optional action retained until it is clicked or the toast is morphed. */
  action?: ToastOptions["action"];
  /** Timeout IDs for animation phases that must be cancelled on teardown. */
  timers: number[];
}

const MAX_VISIBLE_TOASTS = 3;
const DEFAULT_DURATIONS: Record<ToastTone, number> = { note: 4000, done: 4000, fail: 8000 };
const POSITIONS: ToastPosition[] = ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"];
const ARRIVAL_GLYPH_DURATION = 300;
const WIDTH_TRANSITION_DURATION = 420;
const EXIT_GLYPH_DURATION = 340;
const EXIT_SCALE_DURATION = 300;

/** Iconify identifier rendered by the globally registered `dota-icon` notification threshold. */
const NOTIFICATION_ICON = "material-symbols:notifications-rounded";

/** Trusted closing marks plus the Dota UI notification icon used on arrival and neutral expiry. */
const GLYPHS = {
  bell: `<dota-icon name="${NOTIFICATION_ICON}" size="sm"></dota-icon>`,
  done: `<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7"/></svg>`,
  fail: `<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
};

/**
 * Persistent host for application notifications.
 *
 * The host owns one rail, one animation clock, and all active records. Public
 * calls through {@link Toast} coalesce matching IDs, preserve a maximum of
 * three active toasts, and reuse the same element for promise outcomes. It is mounted beside
 * the routed app in `index.html`, so notifications remain available during every route change.
 *
 * Selector: `dota-toast`.
 */
@Component({
  selector: "dota-toast",
  shadow: false,
})
export class DotaToastComponent extends BaseElement implements ToastHost {
  private rail!: HTMLElement;
  private alerts!: HTMLElement;
  private readonly live = new Map<string, ToastRecord>();
  private sequence = 0;
  private animationFrame: number | null = null;
  private lastFrame = 0;
  private isHovering = false;
  private isFocused = false;

  constructor() {
    super();
  }

  /** Connects the singleton service after the stable rail markup has rendered. */
  @OnEvent("connected", true)
  onConnected(): void {
    this.rail = this.querySelector<HTMLElement>("#dota-toast-rail")!;
    this.alerts = this.querySelector<HTMLElement>("#dota-toast-alerts")!;
    Toast.connect(this);
  }

  /** Stops animation work and leaves no singleton reference behind on teardown. */
  @OnEvent("disconnected", true)
  onDisconnected(): void {
    if (this.animationFrame !== null) {
      window.cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    this.live.forEach((record) => this.cancelPhases(record));
    this.live.clear();
    Toast.disconnect(this);
  }

  /** Pauses countdowns while the tab cannot be read. */
  @DocumentListener({ event: "visibilitychange" })
  updateVisibilityPause(): void {
    this.lastFrame = 0;
  }

  /** Pauses countdowns while a pointer is over any interactive toast. */
  @HostListener({ event: "pointerover" })
  pauseForPointer(): void {
    this.isHovering = true;
  }

  /** Resumes only when the pointer leaves the rail entirely. */
  @HostListener({ event: "pointerout" })
  resumeAfterPointer(event: PointerEvent): void {
    if (!this.rail.contains(event.relatedTarget as Node | null)) {
      this.isHovering = false;
      this.lastFrame = 0;
    }
  }

  /** Pauses countdowns while any toast control is focused. */
  @HostListener({ event: "focusin" })
  pauseForFocus(): void {
    this.isFocused = true;
  }

  /** Resumes after focus moves outside the rail. */
  @HostListener({ event: "focusout" })
  resumeAfterFocus(): void {
    window.setTimeout(() => {
      this.isFocused = this.rail.contains(document.activeElement);
      this.lastFrame = 0;
    }, 0);
  }

  /** Opens a toast or refreshes the matching active identity. */
  show(tone: ToastTone, message: string, options: ToastOptions = {}): string {
    const existing = options.id ? this.live.get(options.id) : undefined;
    if (existing) {
      existing.count += 1;
      existing.message = message;
      existing.messageElement.textContent = message;
      existing.countElement.hidden = false;
      existing.countElement.textContent = `×${existing.count}`;
      existing.remaining = existing.duration;
      this.draw(existing);
      existing.element.animate([{ transform: "scale(1)" }, { transform: "scale(1.02)" }, { transform: "scale(1)" }], {
        duration: this.prefersReducedMotion() ? 0 : 240,
        easing: "cubic-bezier(.2,.8,.2,1)",
      });
      return existing.id;
    }

    while (this.live.size >= MAX_VISIBLE_TOASTS) {
      const oldest = this.live.values().next().value as ToastRecord | undefined;
      if (!oldest) {
        break;
      }
      this.expire(oldest);
    }

    const id = options.id ?? `toast-${++this.sequence}`;
    const element = this.createToast(tone, message, options);
    const record: ToastRecord = {
      id,
      tone,
      message,
      element,
      fill: element.querySelector<HTMLElement>(".dota-toast__fill")!,
      messageElement: element.querySelector<HTMLElement>(".dota-toast__message")!,
      countElement: element.querySelector<HTMLElement>(".dota-toast__count")!,
      glyph: element.querySelector<HTMLElement>(".dota-toast__glyph")!,
      glyphIcon: element.querySelector<HTMLElement>(".dota-toast__glyph-icon")!,
      duration: options.duration ?? (options.action ? 7000 : DEFAULT_DURATIONS[tone]),
      remaining: 0,
      count: 1,
      sticky: options.sticky ?? false,
      pending: false,
      armed: false,
      held: false,
      closing: false,
      action: options.action,
      timers: [],
    };
    record.remaining = record.duration;
    this.live.set(id, record);
    this.rail.append(element);
    element.style.setProperty("--dota-toast-width", `${this.measureWidth(element)}px`);
    this.wireToast(record);
    this.startEntrance(record);
    this.runClock();

    if (tone === "fail") {
      this.alerts.textContent = message;
    }

    return id;
  }

  /** Changes the single rail anchor without rebuilding its contents. */
  position(position: ToastPosition): void {
    if (!POSITIONS.includes(position)) {
      return;
    }
    this.rail.dataset.position = position;
  }

  /** Dismisses one toast through the visitor-initiated exit. */
  dismiss(id: string): void {
    const record = this.live.get(id);
    if (record) {
      this.fly(record, 0);
    }
  }

  /** Dismisses all active toasts. */
  clear(): void {
    [...this.live.values()].forEach((record) => this.fly(record, 0));
  }

  /** Shows one indeterminate toast, then morphs it in place when work settles. */
  promise<T>(work: Promise<T> | (() => Promise<T>), options: ToastPromiseOptions<T>): Promise<T> {
    const id = this.show("note", options.pending, { id: options.id, sticky: true });
    const record = this.live.get(id)!;
    record.pending = true;
    record.element.classList.add("is-pending", "is-sticky");
    const promise = typeof work === "function" ? work() : work;

    return promise.then(
      (value) => {
        const active = this.live.get(id);
        if (active) {
          this.morph(active, "done", typeof options.done === "function" ? options.done(value) : options.done);
        }
        return value;
      },
      (reason: unknown) => {
        const active = this.live.get(id);
        if (active) {
          const message = options.fail
            ? typeof options.fail === "function" ? options.fail(reason) : options.fail
            : "Something went wrong.";
          this.morph(active, "fail", message);
        }
        throw reason;
      },
    );
  }

  /** Builds trusted toast DOM once; subsequent state changes update this stable node. */
  private createToast(tone: ToastTone, message: string, options: ToastOptions): HTMLElement {
    const element = document.createElement("div");
    element.className = "dota-toast__item";
    element.dataset.tone = tone;
    element.tabIndex = 0;
    element.setAttribute("aria-label", message);
    if (tone === "fail") {
      element.setAttribute("aria-live", "off");
    }
    if (options.action) {
      element.classList.add("has-action");
    }
    if (options.sticky) {
      element.classList.add("is-sticky");
    }
    element.innerHTML = HTML`
      <span class="dota-toast__fill"></span>
      <span class="dota-toast__glyph" aria-hidden="true"><span class="dota-toast__glyph-icon"></span></span>
      <span class="dota-toast__body">
        <span class="dota-toast__message"></span>
        <span class="dota-toast__count" data-count hidden></span>
      </span>
      <span class="dota-toast__instructions">Focused. Press Delete, Backspace, or Escape to dismiss, or swipe.</span>
    `;
    element.querySelector<HTMLElement>(".dota-toast__message")!.textContent = message;

    if (options.action) {
      const action = document.createElement("button");
      action.className = "dota-toast__action";
      action.type = "button";
      action.textContent = options.action.label;
      element.querySelector<HTMLElement>(".dota-toast__body")!.append(action);
    }

    return element;
  }

  /**
   * Finds the natural open-pill width without showing a measurement node.
   *
   * The temporary clone keeps the common 20rem minimum but lets longer message
   * and action content expand; the rail width remains the upper bound on small
   * screens and narrow windows.
   */
  private measureWidth(element: HTMLElement): number {
    const clone = element.cloneNode(true) as HTMLElement;
    clone.classList.add("is-open", "dota-toast__measure");
    clone.style.cssText = "position:absolute; visibility:hidden; inline-size:auto; max-inline-size:none; transform:none; transition:none";
    this.rail.append(clone);
    const width = Math.ceil(clone.getBoundingClientRect().width);
    clone.remove();
    return Math.min(width, this.rail.clientWidth || width);
  }

  /** Starts the circle-to-pill arrival before allowing its countdown to begin. */
  private startEntrance(record: ToastRecord): void {
    record.glyphIcon.innerHTML = GLYPHS.bell;
    record.glyph.classList.add("is-note");
    record.glyph.classList.add("is-shown");
    this.schedulePhase(record, 0, () => {
      record.element.classList.add("is-in");
      this.schedulePhase(record, this.prefersReducedMotion() ? 0 : ARRIVAL_GLYPH_DURATION, () => {
        record.glyph.classList.remove("is-shown");
        record.element.classList.add("is-open");
        this.schedulePhase(record, this.prefersReducedMotion() ? 0 : WIDTH_TRANSITION_DURATION, () => {
          record.armed = true;
          record.remaining = record.duration;
          this.draw(record);
        });
      });
    });
  }

  /** Wires the few interactions that are created dynamically with each toast. */
  private wireToast(record: ToastRecord): void {
    const action = record.element.querySelector<HTMLButtonElement>(".dota-toast__action");
    action?.addEventListener("click", () => {
      action.blur();
      const outcome = record.action?.onClick?.(record.id);
      if (typeof outcome === "string") {
        this.morph(record, "done", outcome);
      } else if (outcome) {
        this.morph(record, outcome.tone, outcome.message, outcome.duration);
      } else {
        this.fly(record, 0);
      }
    });

    record.element.addEventListener("keydown", (event) => {
      if (event.target !== record.element || !["Delete", "Backspace", "Escape"].includes(event.key)) {
        return;
      }
      event.preventDefault();
      this.fly(record, 0);
    });

    let startX: number | null = null;
    let deltaX = 0;
    record.element.addEventListener("pointerdown", (event) => {
      if ((event.target as HTMLElement).closest("button")) {
        return;
      }
      startX = event.clientX;
      deltaX = 0;
      record.held = true;
      record.element.setPointerCapture(event.pointerId);
      record.element.style.transition = "none";
    });
    record.element.addEventListener("pointermove", (event) => {
      if (startX === null) {
        return;
      }
      deltaX = event.clientX - startX;
      record.element.style.transform = `translateX(${deltaX}px)`;
      record.element.style.opacity = String(Math.max(0, 1 - Math.abs(deltaX) / (record.element.offsetWidth * 0.9)));
    });
    const endDrag = (): void => {
      if (startX === null) {
        return;
      }
      const shouldDismiss = Math.abs(deltaX) > record.element.offsetWidth * 0.25;
      startX = null;
      record.held = false;
      record.element.style.transition = "";
      if (shouldDismiss) {
        this.fly(record, deltaX);
      } else {
        record.element.style.transform = "";
        record.element.style.opacity = "";
      }
    };
    record.element.addEventListener("pointerup", endDrag);
    record.element.addEventListener("pointercancel", endDrag);
  }

  /** Moves an existing toast into its settled outcome without replaying its entrance. */
  private morph(record: ToastRecord, tone: ToastTone, message: string, duration = DEFAULT_DURATIONS[tone]): void {
    record.element.dataset.tone = tone;
    record.element.classList.remove("is-pending", "is-sticky", "has-action");
    record.element.querySelector(".dota-toast__action")?.remove();
    record.tone = tone;
    record.message = message;
    record.messageElement.textContent = message;
    record.pending = false;
    record.sticky = false;
    record.action = undefined;
    record.duration = duration;
    record.remaining = duration;
    record.armed = true;
    record.element.style.setProperty("--dota-toast-width", `${this.measureWidth(record.element)}px`);
    this.draw(record);
    if (tone === "fail") {
      this.alerts.textContent = message;
    }
    this.runClock();
  }

  /** Advances every time-bound toast with one shared animation clock. */
  private runClock(): void {
    if (this.animationFrame !== null) {
      return;
    }
    this.animationFrame = window.requestAnimationFrame((time) => this.tick(time));
  }

  /**
   * Advances the shared clock and schedules the next frame while records remain.
   *
   * Countdown is intentionally skipped for unreadable, pending, sticky, or
   * dragged records so every visible fill resumes from its previous length.
   */
  private tick(time: number): void {
    const elapsed = time - (this.lastFrame || time);
    this.lastFrame = time;
    const isPaused = this.isHovering || this.isFocused || document.hidden;
    this.live.forEach((record) => {
      if (isPaused || record.sticky || record.pending || record.held || !record.armed) {
        return;
      }
      record.remaining -= elapsed;
      this.draw(record);
      if (record.remaining <= 0) {
        this.expire(record);
      }
    });
    this.animationFrame = this.live.size ? window.requestAnimationFrame((nextTime) => this.tick(nextTime)) : null;
    if (this.animationFrame === null) {
      this.lastFrame = 0;
    }
  }

  /** Draws the remaining time as a feathered fill length. */
  private draw(record: ToastRecord): void {
    record.fill.style.setProperty("--dota-toast-progress", String(Math.max(0, Math.min(1, record.remaining / record.duration))));
  }

  /** Uses the natural-time exit: collapse, outcome glyph, then a matching scale-out. */
  private expire(record: ToastRecord): void {
    if (record.closing) {
      return;
    }
    record.closing = true;
    this.live.delete(record.id);
    this.cancelPhases(record);
    record.element.classList.add("is-closing");
    record.element.classList.remove("is-open");
    if (this.prefersReducedMotion()) {
      record.element.classList.remove("is-in");
      this.schedulePhase(record, 150, () => this.removeToast(record));
      return;
    }
    this.schedulePhase(record, WIDTH_TRANSITION_DURATION, () => {
      const kind = record.tone === "done" ? "done" : record.tone === "fail" ? "fail" : "bell";
      record.glyphIcon.innerHTML = GLYPHS[kind];
      record.glyph.className = `dota-toast__glyph is-shown is-${kind === "bell" ? "note" : kind}`;
      this.schedulePhase(record, EXIT_GLYPH_DURATION, () => {
        record.element.classList.remove("is-in");
        this.schedulePhase(record, EXIT_SCALE_DURATION, () => this.removeToast(record));
      });
    });
  }

  /** Uses the immediate directional exit reserved for a visitor dismissal. */
  private fly(record: ToastRecord, deltaX: number): void {
    if (record.closing || !this.live.delete(record.id)) {
      return;
    }
    record.closing = true;
    this.cancelPhases(record);
    const direction = deltaX === 0 ? 1 : Math.sign(deltaX);
    record.element.classList.add("is-gone");
    record.element.style.transform = `translateX(${direction * (record.element.offsetWidth + 24)}px)`;
    record.element.style.opacity = "0";
    this.schedulePhase(record, this.prefersReducedMotion() ? 0 : 230, () => this.removeToast(record));
  }

  /** Removes one completed node after its exit and clears retained timers. */
  private removeToast(record: ToastRecord): void {
    this.cancelPhases(record);
    const survivors = Array.from(this.rail.children).filter((element) => element !== record.element) as HTMLElement[];
    const previousTop = survivors.map((element) => element.getBoundingClientRect().top);
    record.element.remove();
    if (this.prefersReducedMotion()) {
      return;
    }
    survivors.forEach((element, index) => {
      const distance = previousTop[index] - element.getBoundingClientRect().top;
      if (distance) {
        element.animate([{ transform: `translateY(${distance}px)` }, { transform: "none" }], {
          duration: 260,
          easing: "cubic-bezier(.2,.8,.2,1)",
        });
      }
    });
  }

  /** Cancels pending entrance or exit phase work before a record changes lifecycle. */
  private cancelPhases(record: ToastRecord): void {
    record.timers.forEach((timer) => window.clearTimeout(timer));
    record.timers = [];
  }

  /** Tracks each delayed phase so teardown can cancel work safely. */
  private schedulePhase(record: ToastRecord, delay: number, callback: () => void): void {
    const timer = window.setTimeout(() => {
      record.timers = record.timers.filter((value) => value !== timer);
      callback();
    }, delay);
    record.timers.push(timer);
  }

  /** Keeps animation phases readable under the user's reduced-motion preference. */
  private prefersReducedMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /** Renders the persistent rail and a separate assertive live region for failures. */
  render(): string {
    return HTML`
      <section class="dota-toast__rail" id="dota-toast-rail" data-position="bottom-right" role="region" aria-label="Notifications" aria-live="polite" aria-relevant="additions"></section>
      <output class="dota-toast__alerts" id="dota-toast-alerts" aria-live="assertive" aria-atomic="true"></output>
    `;
  }
}

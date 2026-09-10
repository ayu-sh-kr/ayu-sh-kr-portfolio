import {CARD_DECK_INTERACTION, CardDeckMachine} from "@app/components/utils/card-deck/card-deck.machine.ts";
import {trackCardDeckLink, trackCardDeckNavigation, trackCardDeckSwipe} from "@app/components/utils/card-deck/card-deck-analytics.ts";
import {isAnalyticsCardDeckLink, type AnalyticsCardDeck, type AnalyticsCardDeckInput} from "@app/events/analytics.events.ts";

/**
 * CSS-variable names that translate the shared deck state into one deck's visual language.
 *
 * Each deck keeps its existing stylesheet and transform properties. The lifecycle service
 * only assigns these names while a card is resting, being pulled, or leaving the stack.
 */
export type CardDeckCssVariables = {
  /** Custom property receiving the authored resting tilt for each card. */
  tilt: string;
  /** Custom property receiving the card's current stack depth. */
  depth: string;
  /** Custom property receiving the horizontal offset. */
  x: string;
  /** Custom property receiving the vertical offset. */
  y: string;
  /** Custom property receiving the card rotation. */
  rotation: string;
  /** Custom property receiving the animated transition duration. */
  duration: string;
  /** Optional property used by decks whose stack reacts to pull progress. */
  progress?: string;
  /** Optional property used by decks whose stylesheet exposes raw horizontal drag distance. */
  dragDistance?: string;
};

/**
 * DOM and presentation contract supplied by one card-deck component.
 *
 * The component owns the markup and supplies these selectors after its initial render.
 * The service uses them to make all decks share the same interaction, accessibility, and
 * analytics behavior without forcing their layouts or visual tokens to match.
 */
export type CardDeckLifecycleOptions = {
  /** Stable analytics identity for this deck surface. */
  deck: AnalyticsCardDeck;
  /** Selector for the stacked card elements, ordered back-to-front in the rendered markup. */
  cardSelector: string;
  /** Selector for the keyboard-focusable deck surface. */
  deckSelector: string;
  /** Selector for the optional backward navigation button. */
  previousSelector: string;
  /** Selector for the forward navigation button. */
  nextSelector: string;
  /** Selector for the navigation tick container. */
  tickListSelector: string;
  /** Selector for the polite live region that announces the active card. */
  liveRegionSelector: string;
  /** Selector for the hint retired after a visitor first navigates. */
  hintSelector: string;
  /** Class used by dynamically created navigation ticks. */
  tickClassName: string;
  /** One tilt per card, in visible-card order. */
  cardTilts: readonly string[];
  /** Deck-specific CSS variable names used to position and animate cards. */
  variables: CardDeckCssVariables;
};

/**
 * The in-progress pointer gesture for the active card.
 *
 * A gesture is retained only between `pointerdown` and `pointerup`/`pointercancel`. Its
 * timestamp and previous horizontal position let the release step distinguish a deliberate
 * flick from a shorter pull, while `moved` prevents ordinary clicks from becoming analytics.
 */
type CardDeckDrag = {
  /** Card that owns pointer capture until the gesture resolves. */
  element: HTMLElement;
  /** Browser pointer identity used to ignore unrelated touches or mouse pointers. */
  pointerId: number;
  /** Horizontal pointer coordinate at gesture start. */
  startX: number;
  /** Vertical pointer coordinate at gesture start. */
  startY: number;
  /** Rotation polarity derived from whether the visitor grabbed above or below the card midpoint. */
  grabSign: number;
  /** Timestamp of the previous velocity sample. */
  timestamp: number;
  /** Horizontal pointer coordinate of the previous velocity sample. */
  lastX: number;
  /** Latest horizontal velocity in CSS pixels per millisecond. */
  velocity: number;
  /** Whether the pointer exceeded the small movement allowance reserved for clicks. */
  moved: boolean;
};

/**
 * Owns the shared interactive lifecycle for the portfolio's pullable card decks.
 *
 * Components create one instance with their selectors and CSS-variable mapping, call
 * {@link connect} after their light-DOM markup is available, and call {@link disconnect}
 * when their route leaves. This centralizes pointer, button, keyboard, tick, accessibility,
 * transition, and analytics behavior while keeping authored content and deck visuals local.
 */
export class CardDeckLifecycleService {
  private abortController: AbortController | null = null;
  private cards: HTMLElement[] = [];
  private ticks: HTMLElement[] = [];
  private machine = new CardDeckMachine(1);
  private unsubscribe: (() => void) | null = null;
  private drag: CardDeckDrag | null = null;
  private isBusy = false;
  private hintRetired = false;
  private furthestCardReached = 1;
  private timers: number[] = [];

  /**
   * Retains the static integration contract for one component instance.
   *
   * Options are deliberately supplied once: the same component reconnects with the same
   * markup vocabulary, while mutable DOM references are refreshed by {@link connect}.
   */
  constructor(private readonly options: CardDeckLifecycleOptions) {}

  /**
   * Wires an already-rendered deck and resets visit-scoped interaction state.
   *
   * The component calls this from its scoped `connected` handler, after Dota has rendered
   * the light DOM. Missing required controls leave the service inert rather than attaching a
   * partial interaction model; normal route teardown is still safe through {@link disconnect}.
   *
   * @param host - Component host containing this deck's rendered cards and controls.
   */
  connect(host: HTMLElement): void {
    this.disconnect();
    this.abortController = new AbortController();
    this.cards = Array.from(host.querySelectorAll<HTMLElement>(this.options.cardSelector)).reverse();
    if (this.cards.length === 0) return;

    this.machine = new CardDeckMachine(this.cards.length);
    this.furthestCardReached = 1;
    this.hintRetired = false;
    this.cards.forEach((card, index) => card.style.setProperty(this.options.variables.tilt, this.options.cardTilts[index] ?? "0deg"));
    this.createTicks(host);
    this.unsubscribe = this.machine.subscribe(() => this.renderDeck(host));

    const deck = host.querySelector<HTMLElement>(this.options.deckSelector);
    const previous = host.querySelector<HTMLButtonElement>(this.options.previousSelector);
    const next = host.querySelector<HTMLButtonElement>(this.options.nextSelector);
    if (!deck || !previous || !next) return;

    const listenerOptions = {signal: this.abortController.signal};
    previous.addEventListener("click", () => this.showPrevious("button", host), listenerOptions);
    next.addEventListener("click", () => this.commitNext(1, 0, "button", host), listenerOptions);
    deck.addEventListener("click", (event) => this.trackLinkClick(event), listenerOptions);
    deck.addEventListener("keydown", (event) => this.handleKeyboard(event, host), listenerOptions);
    deck.addEventListener("pointerdown", (event) => this.startDrag(event), listenerOptions);
    deck.addEventListener("pointermove", (event) => this.moveDrag(event), listenerOptions);
    deck.addEventListener("pointerup", (event) => this.endDrag(event, host), listenerOptions);
    deck.addEventListener("pointercancel", (event) => this.endDrag(event, host), listenerOptions);
  }

  /**
   * Releases listeners, subscriptions, and delayed transition cleanup for a disconnected deck.
   *
   * Components call this from their scoped `disconnected` handler. Aborting one controller
   * removes every dynamic listener installed by {@link connect}, so a later connection cannot
   * receive gestures or analytics from an old route instance.
   */
  disconnect(): void {
    this.abortController?.abort();
    this.unsubscribe?.();
    this.timers.forEach((timer) => window.clearTimeout(timer));
    this.abortController = null;
    this.unsubscribe = null;
    this.timers = [];
    this.drag = null;
    this.isBusy = false;
    this.ticks = [];
    this.cards = [];
  }

  /**
   * Builds the per-card picker after the service knows the actual rendered card count.
   *
   * Tick handlers deliberately call the same navigation path as buttons and keyboard input,
   * preserving transition and analytics semantics no matter how a visitor selects a card.
   *
   * @param host - Component host containing the tick-list container.
   */
  private createTicks(host: HTMLElement): void {
    const tickList = host.querySelector<HTMLElement>(this.options.tickListSelector);
    if (!tickList) return;

    this.ticks = this.cards.map((_, index) => {
      const tick = document.createElement("span");
      tick.className = this.options.tickClassName;
      tick.setAttribute("aria-hidden", "true");
      tickList.append(tick);
      return tick;
    });
  }

  /**
   * Applies stack depth, inert state, picker state, and the active-card announcement.
   *
   * This is the machine subscription target. It never changes the machine itself, keeping
   * state transitions separate from the DOM projection that runs after each navigation.
   *
   * @param host - Component host containing the live region updated for assistive technology.
   */
  private renderDeck(host: HTMLElement): void {
    this.cards.forEach((card, index) => {
      const depth = this.depthOf(index);
      if (!card.classList.contains("is-leaving")) {
        card.classList.add("is-animated");
        this.setCardPosition(card, depth);
        card.style.removeProperty(this.options.variables.duration);
      }
      card.classList.toggle("is-top", depth === 0);
      card.toggleAttribute("inert", depth !== 0);
    });
    this.ticks.forEach((tick, index) => tick.setAttribute("aria-current", String(index === this.machine.top)));
    this.setControlAvailability(host);
    const title = this.cards[this.machine.top]?.querySelector("h1, h2")?.textContent?.trim() ?? "";
    const liveRegion = host.querySelector<HTMLElement>(this.options.liveRegionSelector);
    if (liveRegion) liveRegion.textContent = `Card ${this.machine.top + 1} of ${this.machine.count}. ${title}`;
  }

  /**
   * Sends the active card away, advances the machine, and schedules its reseating.
   *
   * This is used by pointer pulls, the next button, keyboard movement, and adjacent picker
   * selections. The caller supplies the input channel so the navigation event remains useful
   * when comparing interaction patterns in analytics.
   *
   * @param direction - Sign used only for the card's exit direction.
   * @param velocity - Latest pointer velocity; controls the bounded animation duration.
   * @param input - Visitor input channel responsible for this position change.
   * @param host - Component host used when the machine projects its new state.
   */
  private commitNext(direction: number, velocity: number, input: AnalyticsCardDeckInput, host: HTMLElement): void {
    if (this.isBusy || input !== "pointer" && !this.machine.canNext) return;
    this.isBusy = true;
    const card = this.cards[this.machine.top];
    const duration = Math.round(Math.max(240, Math.min(420, 340 - Math.abs(velocity) * 90)));
    card.classList.add("is-animated", "is-leaving");
    card.style.setProperty(this.options.variables.duration, `${duration}ms`);
    card.style.setProperty(this.options.variables.x, `${direction > 0 ? 125 : -125}%`);
    card.style.setProperty(this.options.variables.y, "40px");
    card.style.setProperty(this.options.variables.rotation, `${direction > 0 ? 9 : -9}deg`);

    const fromCard = this.machine.top + 1;
    this.machine.advance(input === "pointer");
    this.trackNavigation(input, fromCard);
    this.defer(() => {
      card.classList.remove("is-leaving");
      this.silently(card, () => this.setCardPosition(card, this.machine.count - 1));
      this.isBusy = false;
    }, duration);
    this.retireHint(host);
  }

  /**
   * Returns the preceding card from the left when the restored control is selected.
   *
   * This control-only path keeps the sequence's swipe gestures forward-only while preserving the
   * established return animation for visitors who intentionally use the left arrow.
   *
   * @param input - Visitor input channel responsible for this position change.
   * @param host - Component host used when the machine projects its new state.
   */
  private showPrevious(input: AnalyticsCardDeckInput, host: HTMLElement): void {
    if (this.isBusy || !this.machine.canPrevious) return;
    this.isBusy = true;
    const card = this.cards[this.machine.top - 1];
    card.classList.add("is-incoming");
    this.silently(card, () => {
      this.setCardPosition(card, 0);
      card.style.setProperty(this.options.variables.x, "-125%");
      card.style.setProperty(this.options.variables.y, "40px");
      card.style.setProperty(this.options.variables.rotation, "-9deg");
    });

    const fromCard = this.machine.top + 1;
    this.machine.previous();
    this.trackNavigation(input, fromCard);
    this.defer(() => {
      card.classList.remove("is-incoming");
      this.isBusy = false;
    }, 420);
    this.retireHint(host);
  }

  /**
   * Converts supported deck keys into the same navigation flows used by pointer controls.
   *
   * The deck remains a normal focusable group: only keys the component owns are prevented, so
   * Tab and other browser navigation continue to work normally.
   *
   * @param event - Keyboard event dispatched by the deck surface.
   * @param host - Component host used when the selected navigation updates the deck.
   */
  private handleKeyboard(event: KeyboardEvent, host: HTMLElement): void {
    const actions: Record<string, () => void> = {
      ArrowRight: () => this.commitNext(1, 0, "keyboard", host),
      ArrowDown: () => this.commitNext(1, 0, "keyboard", host),
      End: () => this.commitNext(1, 0, "keyboard", host),
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  }

  /**
   * Starts a pull only when the top card itself, rather than a nested control, is pressed.
   *
   * Pointer capture ensures a release outside the card still settles the active gesture. Links
   * and buttons remain ordinary controls and are tracked separately by {@link trackLinkClick}.
   *
   * @param event - Pointer press from the deck surface.
   */
  private startDrag(event: PointerEvent): void {
    if (this.isBusy || event.button !== 0) return;
    const card = this.cards[this.machine.top];
    const target = event.target as HTMLElement;
    if (!card.contains(target) || target.closest("a, button")) return;

    const box = card.getBoundingClientRect();
    this.drag = {
      element: card,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      grabSign: event.clientY - box.top < box.height / 2 ? 1 : -1,
      timestamp: performance.now(),
      lastX: event.clientX,
      velocity: 0,
      moved: false,
    };
    card.setPointerCapture(event.pointerId);
    card.classList.remove("is-animated");
    card.classList.add("is-grabbed");
  }

  /**
   * Projects the live pull distance onto the top card and the stack beneath it.
   *
   * Pointer moves are deliberately visual only. Analytics is emitted once in {@link endDrag},
   * which captures both abandoned and committed gestures without producing a noisy event stream.
   *
   * @param event - Pointer movement from the deck surface.
   */
  private moveDrag(event: PointerEvent): void {
    if (!this.drag || event.pointerId !== this.drag.pointerId) return;
    const horizontal = event.clientX - this.drag.startX;
    const vertical = event.clientY - this.drag.startY;
    if (!this.drag.moved && Math.abs(horizontal) < 4 && Math.abs(vertical) < 4) return;

    this.drag.moved = true;
    const now = performance.now();
    const elapsed = now - this.drag.timestamp;
    if (elapsed > 8) {
      this.drag.velocity = (event.clientX - this.drag.lastX) / elapsed;
      this.drag.lastX = event.clientX;
      this.drag.timestamp = now;
    }

    const x = this.resist(horizontal);
    const progress = Math.min(1, Math.abs(horizontal) / CARD_DECK_INTERACTION.swipeThreshold);
    this.drag.element.style.setProperty(this.options.variables.x, `${x}px`);
    this.drag.element.style.setProperty(this.options.variables.y, `${this.resist(vertical) * 0.22 - 4}px`);
    this.drag.element.style.setProperty(this.options.variables.rotation, `${Math.max(-6, Math.min(6, x * 0.045 * this.drag.grabSign))}deg`);
    if (this.options.variables.dragDistance) this.drag.element.style.setProperty(this.options.variables.dragDistance, `${x}px`);
    if (this.options.variables.progress) this.drag.element.style.setProperty(this.options.variables.progress, String(progress));
    this.cards.forEach((card, index) => {
      const depth = this.depthOf(index);
      if (depth === 0) return;
      card.classList.remove("is-animated");
      card.style.setProperty(this.options.variables.depth, String(depth - progress * 0.85));
    });
  }

  /**
   * Finishes a pointer pull by either advancing the deck or restoring the resting stack.
   *
   * Every real pull produces a single swipe event containing distance and completion status.
   * A committed pull follows the forward-navigation path, which adds its position event and
   * transition cleanup.
   *
   * @param event - Pointer release or cancellation from the deck surface.
   * @param host - Component host used if a committed pull advances the deck.
   */
  private endDrag(event: PointerEvent, host: HTMLElement): void {
    if (!this.drag || event.pointerId !== this.drag.pointerId) return;
    const drag = this.drag;
    const distance = event.clientX - drag.startX;
    drag.element.classList.remove("is-grabbed");
    this.drag = null;
    if (!drag.moved) {
      drag.element.classList.add("is-animated");
      return;
    }

    const crossedThreshold = Math.abs(distance) > CARD_DECK_INTERACTION.swipeThreshold
      || Math.abs(drag.velocity) > CARD_DECK_INTERACTION.flickVelocity && Math.abs(distance) > CARD_DECK_INTERACTION.flickDistance;
    const completed = crossedThreshold;
    trackCardDeckSwipe(this.options.deck, this.machine.top + 1, this.machine.count, distance, completed);
    if (completed) {
      return this.commitNext(distance || drag.velocity, drag.velocity, "pointer", host);
    }

    this.cards.forEach((card, index) => {
      card.classList.add("is-animated");
      card.style.setProperty(this.options.variables.duration, "340ms");
      this.setCardPosition(card, this.depthOf(index));
    });
  }

  /**
   * Records a marked deck link before normal browser or router navigation begins.
   *
   * Content modules assign `data-card-deck-link` and `data-card-deck-destination` to authored
   * links. Invalid or unmarked links are intentionally ignored, so decorative links cannot
   * expand the analytics contract by accident.
   *
   * @param event - Click bubbling from a link in the deck surface.
   */
  private trackLinkClick(event: Event): void {
    const link = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-card-deck-link]");
    const linkType = link?.dataset.cardDeckLink;
    const destination = link?.dataset.cardDeckDestination;
    if (!isAnalyticsCardDeckLink(linkType) || !destination) return;
    trackCardDeckLink(this.options.deck, linkType, destination, this.machine.top + 1, this.furthestCardReached);
  }

  /**
   * Updates visit progress and publishes a normalized navigation event after a machine change.
   *
   * Centralizing the publication keeps button, keyboard, picker, and pointer journeys directly
   * comparable; callers only need to retain the active card before changing the machine.
   *
   * @param input - Visitor input channel that changed the active card.
   * @param fromCard - One-based active-card position before the machine transition.
   */
  private trackNavigation(input: AnalyticsCardDeckInput, fromCard: number): void {
    this.furthestCardReached = Math.max(this.furthestCardReached, this.machine.top + 1);
    trackCardDeckNavigation(this.options.deck, input, fromCard, this.machine.top + 1, this.machine.count, this.furthestCardReached);
  }

  /**
   * Reflects the bounded deck position in the left and right arrow states.
   *
   * Each button becomes disabled at its matching edge. Swipes remain forward-only and settle at
   * the final card, while the left arrow retains its intentional return path and animation.
   *
   * @param host - Component host containing the navigation controls rendered by the deck shell.
   */
  private setControlAvailability(host: HTMLElement): void {
    const previous = host.querySelector<HTMLButtonElement>(this.options.previousSelector);
    const next = host.querySelector<HTMLButtonElement>(this.options.nextSelector);
    if (previous) previous.disabled = !this.machine.canPrevious;
    if (next) next.disabled = !this.machine.canNext;
  }

  /**
   * Calculates a card's circular depth relative to the active machine position.
   *
   * The result always falls between zero and `count - 1`, allowing every deck to reuse the
   * same cyclic stack behavior even though their card counts and visual styles differ.
   *
   * @param index - Zero-based card index in visible-card order.
   * @returns Current circular stack depth for the card.
   */
  private depthOf(index: number): number {
    return (index - this.machine.top + this.machine.count) % this.machine.count;
  }

  /**
   * Restores a card to a neutral stacked position using this deck's CSS-variable mapping.
   *
   * Both subscription rendering and cancelled pulls call this method, ensuring a deck's visual
   * state cannot diverge from its machine state after an interrupted gesture or animation.
   *
   * @param card - Rendered card whose inline transform variables should be reset.
   * @param depth - Circular stack depth calculated from the current machine state.
   */
  private setCardPosition(card: HTMLElement, depth: number): void {
    card.style.setProperty(this.options.variables.depth, String(depth));
    card.style.setProperty(this.options.variables.x, "0px");
    card.style.setProperty(this.options.variables.y, "0px");
    card.style.setProperty(this.options.variables.rotation, "0deg");
    if (this.options.variables.dragDistance) card.style.setProperty(this.options.variables.dragDistance, "0px");
    if (this.options.variables.progress) card.style.setProperty(this.options.variables.progress, "0");
  }

  /**
   * Applies a preparatory position without exposing it before the following animation frame.
   *
   * Reading layout between class changes forces the browser to commit the unanimated position;
   * the re-added animation class can then transition from that exact point.
   *
   * @param card - Card receiving an off-screen or reseated preparatory position.
   * @param operation - Inline style changes that establish the preparatory position.
   */
  private silently(card: HTMLElement, operation: () => void): void {
    card.classList.remove("is-animated");
    operation();
    void card.offsetWidth;
    card.classList.add("is-animated");
  }

  /**
   * Softens unusually long pulls while preserving their direction.
   *
   * The threshold is shared with every deck, so a visitor receives the same resistance feel
   * whether they reached the showcase, profile, or direct-contact route.
   *
   * @param value - Raw horizontal or vertical pointer displacement in CSS pixels.
   * @returns Displacement after the shared resistance curve is applied.
   */
  private resist(value: number): number {
    const magnitude = Math.abs(value);
    const limit = CARD_DECK_INTERACTION.resistanceLimit;
    return magnitude <= limit ? value : Math.sign(value) * (limit + (magnitude - limit) * 0.34);
  }

  /**
   * Schedules transition cleanup and keeps its timer available for route teardown.
   *
   * The timer is removed as soon as it runs, and {@link disconnect} clears remaining timers so
   * an old deck cannot mutate detached DOM after a route change.
   *
   * @param callback - Cleanup that completes a card's leaving or incoming transition.
   * @param duration - Transition duration in milliseconds.
   */
  private defer(callback: () => void, duration: number): void {
    const timer = window.setTimeout(() => {
      this.timers = this.timers.filter((pending) => pending !== timer);
      callback();
    }, duration);
    this.timers.push(timer);
  }

  /**
   * Hides the gesture hint after the first successful navigation action in a visit.
   *
   * This is intentionally not triggered by a cancelled pull: the hint remains available until
   * the visitor has actually navigated by pointer, button, keyboard, or the card picker.
   *
   * @param host - Component host containing the deck's hint element.
   */
  private retireHint(host: HTMLElement): void {
    if (this.hintRetired) return;
    this.hintRetired = true;
    host.querySelector<HTMLElement>(this.options.hintSelector)?.setAttribute("data-retired", "true");
  }
}

import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { reachOutContent } from "@app/data/reach-out-content.ts";

const CARD_COUNT = reachOutContent.cards.length;
const SWIPE_THRESHOLD = 88;
const FLICK_VELOCITY = 0.45;
const CARD_TILTS = ["-0.5deg", "0.6deg", "-0.45deg", "0.55deg"];

type DragState = {
  element: HTMLElement;
  pointerId: number;
  startX: number;
  startY: number;
  grabSign: number;
  timestamp: number;
  lastX: number;
  velocity: number;
  moved: boolean;
};

/**
 * Presents a small, shareable client-introduction deck.
 *
 * Each card can be read in place or pulled away with a pointer or keyboard.
 * The component owns the gesture state so the route stays static and can be
 * safely rendered before browser interaction is available.
 *
 * Selector: `reach-out-card-deck`.
 */
@Component({ selector: "reach-out-card-deck", shadow: false })
export class ReachOutCardDeckComponent extends BaseElement {
  private abortController: AbortController | null = null;
  private cards: HTMLElement[] = [];
  private ticks: HTMLButtonElement[] = [];
  private topCardIndex = 0;
  private drag: DragState | null = null;
  private isBusy = false;
  private hintRetired = false;
  private timers: number[] = [];

  constructor() {
    super();
  }

  /** Wires the native gesture events only after the server-rendered deck is connected. */
  @OnEvent("connected", true)
  connectDeck(): void {
    this.abortController = new AbortController();
    // Cards are rendered back-to-front so their static HTML already forms a stack.
    // Interaction indexes them from the visible first card through the last one.
    this.cards = Array.from(this.querySelectorAll<HTMLElement>("[data-reach-out-card]")).reverse();
    this.cards.forEach((card, index) => card.style.setProperty("--reach-out-tilt", CARD_TILTS[index]));
    this.createTicks();
    this.renderDeck();

    const deck = this.querySelector<HTMLElement>("[data-reach-out-deck]");
    const previous = this.querySelector<HTMLButtonElement>("[data-reach-out-previous]");
    const next = this.querySelector<HTMLButtonElement>("[data-reach-out-next]");
    if (!deck || !previous || !next) {
      return;
    }

    const options = { signal: this.abortController.signal };
    previous.addEventListener("click", () => this.showPrevious(), options);
    next.addEventListener("click", () => this.commitNext(1, 0), options);
    deck.addEventListener("keydown", (event) => this.handleKeyboard(event), options);
    deck.addEventListener("pointerdown", (event) => this.startDrag(event), options);
    deck.addEventListener("pointermove", (event) => this.moveDrag(event), options);
    deck.addEventListener("pointerup", (event) => this.endDrag(event), options);
    deck.addEventListener("pointercancel", (event) => this.endDrag(event), options);
  }

  /** Releases route-bound listeners and pending transitions when navigating away. */
  @OnEvent("disconnected", true)
  disconnectDeck(): void {
    this.abortController?.abort();
    this.abortController = null;
    this.timers.forEach((timer) => window.clearTimeout(timer));
    this.timers = [];
    this.drag = null;
    this.isBusy = false;
  }

  /** Builds the card selector after the cards are present in the light DOM. */
  private createTicks(): void {
    const tickList = this.querySelector<HTMLElement>("[data-reach-out-ticks]");
    if (!tickList) {
      return;
    }

    this.ticks = this.cards.map((_, index) => {
      const tick = document.createElement("button");
      tick.type = "button";
      tick.className = "reach-out__tick";
      tick.setAttribute("aria-label", `Card ${index + 1} of ${CARD_COUNT}`);
      tick.addEventListener("click", () => this.goTo(index), { signal: this.abortController?.signal });
      tickList.append(tick);
      return tick;
    });
  }

  /** Applies deck depth, accessibility state, and the current-card announcement. */
  private renderDeck(): void {
    this.cards.forEach((card, index) => {
      const depth = this.depthOf(index);
      if (!card.classList.contains("is-leaving")) {
        card.classList.add("is-animated");
        this.setCardPosition(card, depth);
        card.style.removeProperty("--reach-out-duration");
      }
      card.classList.toggle("is-top", depth === 0);
      card.toggleAttribute("inert", depth !== 0);
    });
    this.ticks.forEach((tick, index) => tick.setAttribute("aria-current", String(index === this.topCardIndex)));

    const liveRegion = this.querySelector<HTMLElement>("[data-reach-out-live]");
    const title = this.cards[this.topCardIndex]?.querySelector("h1, h2")?.textContent?.trim();
    if (liveRegion) {
      liveRegion.textContent = `Card ${this.topCardIndex + 1} of ${CARD_COUNT}. ${title ?? ""}`;
    }
  }

  /** Moves forward, briefly sending the departing top card beyond the deck. */
  private commitNext(direction: number, velocity: number): void {
    if (this.isBusy) {
      return;
    }
    this.isBusy = true;
    const card = this.cards[this.topCardIndex];
    const duration = Math.round(Math.max(240, Math.min(420, 340 - Math.abs(velocity) * 90)));
    card.classList.add("is-animated", "is-leaving");
    card.style.setProperty("--reach-out-duration", `${duration}ms`);
    card.style.setProperty("--reach-out-x", `${direction > 0 ? 125 : -125}%`);
    card.style.setProperty("--reach-out-y", "40px");
    card.style.setProperty("--reach-out-drag-rotation", `${direction > 0 ? 9 : -9}deg`);

    this.topCardIndex = (this.topCardIndex + 1) % CARD_COUNT;
    this.renderDeck();
    this.defer(() => {
      card.classList.remove("is-leaving");
      this.silently(card, () => this.setCardPosition(card, CARD_COUNT - 1));
      this.isBusy = false;
    }, duration);
    this.retireHint();
  }

  /** Brings the previous card back from the left edge of the deck. */
  private showPrevious(): void {
    if (this.isBusy) {
      return;
    }
    this.isBusy = true;
    const index = (this.topCardIndex - 1 + CARD_COUNT) % CARD_COUNT;
    const card = this.cards[index];
    card.classList.add("is-incoming");
    this.silently(card, () => {
      this.setCardPosition(card, 0);
      card.style.setProperty("--reach-out-x", "-125%");
      card.style.setProperty("--reach-out-y", "40px");
      card.style.setProperty("--reach-out-drag-rotation", "-9deg");
    });
    this.topCardIndex = index;
    this.renderDeck();
    this.defer(() => {
      card.classList.remove("is-incoming");
      this.isBusy = false;
    }, 420);
    this.retireHint();
  }

  /** Uses an animated adjacent transition, or reseats the deck for a distant tick. */
  private goTo(index: number): void {
    if (this.isBusy || index === this.topCardIndex) {
      return;
    }
    if (index === (this.topCardIndex + 1) % CARD_COUNT) {
      this.commitNext(1, 0);
      return;
    }
    if (index === (this.topCardIndex - 1 + CARD_COUNT) % CARD_COUNT) {
      this.showPrevious();
      return;
    }
    this.topCardIndex = index;
    this.renderDeck();
    this.retireHint();
  }

  /** Keeps the deck usable with arrows and direct first/last shortcuts. */
  private handleKeyboard(event: KeyboardEvent): void {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      this.commitNext(1, 0);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      this.showPrevious();
    } else if (event.key === "Home") {
      event.preventDefault();
      this.goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      this.goTo(CARD_COUNT - 1);
    }
  }

  /** Starts a horizontal pull only when a non-control part of the top card is pressed. */
  private startDrag(event: PointerEvent): void {
    if (this.isBusy || event.button !== 0) {
      return;
    }
    const card = this.cards[this.topCardIndex];
    const target = event.target as HTMLElement;
    if (!card.contains(target) || target.closest("a, button")) {
      return;
    }
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

  /** Pulls the top card with resistance while the stack below follows continuously. */
  private moveDrag(event: PointerEvent): void {
    if (!this.drag || event.pointerId !== this.drag.pointerId) {
      return;
    }
    const horizontal = event.clientX - this.drag.startX;
    const vertical = event.clientY - this.drag.startY;
    if (!this.drag.moved && Math.abs(horizontal) < 4 && Math.abs(vertical) < 4) {
      return;
    }
    this.drag.moved = true;
    const now = performance.now();
    const elapsed = now - this.drag.timestamp;
    if (elapsed > 8) {
      this.drag.velocity = (event.clientX - this.drag.lastX) / elapsed;
      this.drag.lastX = event.clientX;
      this.drag.timestamp = now;
    }

    const x = this.resist(horizontal);
    this.drag.element.style.setProperty("--reach-out-x", `${x}px`);
    this.drag.element.style.setProperty("--reach-out-y", `${this.resist(vertical) * 0.22 - 4}px`);
    this.drag.element.style.setProperty("--reach-out-drag-rotation", `${Math.max(-6, Math.min(6, x * 0.045 * this.drag.grabSign))}deg`);

    const progress = Math.min(1, Math.abs(horizontal) / SWIPE_THRESHOLD);
    this.cards.forEach((card, index) => {
      const depth = this.depthOf(index);
      if (depth === 0) {
        return;
      }
      card.classList.remove("is-animated");
      card.style.setProperty("--reach-out-depth", String(depth - progress * 0.85));
    });
  }

  /** Commits a decisive pull and otherwise settles every card back into its depth. */
  private endDrag(event: PointerEvent): void {
    if (!this.drag || event.pointerId !== this.drag.pointerId) {
      return;
    }
    const drag = this.drag;
    const distance = event.clientX - drag.startX;
    drag.element.classList.remove("is-grabbed");
    this.drag = null;
    if (!drag.moved) {
      drag.element.classList.add("is-animated");
      return;
    }
    const shouldCommit = Math.abs(distance) > SWIPE_THRESHOLD || (Math.abs(drag.velocity) > FLICK_VELOCITY && Math.abs(distance) > 24);
    if (shouldCommit) {
      this.commitNext(distance || drag.velocity, drag.velocity);
      return;
    }

    this.cards.forEach((card, index) => {
      card.classList.add("is-animated");
      card.style.setProperty("--reach-out-duration", "340ms");
      this.setCardPosition(card, this.depthOf(index));
    });
  }

  /** Returns the circular stack depth for a card index. */
  private depthOf(index: number): number {
    return (index - this.topCardIndex + CARD_COUNT) % CARD_COUNT;
  }

  /** Applies a settled card position using the component-owned transform variables. */
  private setCardPosition(card: HTMLElement, depth: number): void {
    card.style.setProperty("--reach-out-depth", String(depth));
    card.style.setProperty("--reach-out-x", "0px");
    card.style.setProperty("--reach-out-y", "0px");
    card.style.setProperty("--reach-out-drag-rotation", "0deg");
  }

  /** Runs a placement without showing its preparatory position. */
  private silently(card: HTMLElement, operation: () => void): void {
    card.classList.remove("is-animated");
    operation();
    void card.offsetWidth;
    card.classList.add("is-animated");
  }

  /** Limits travel after the first comfortable pull distance. */
  private resist(value: number): number {
    const limit = 110;
    const magnitude = Math.abs(value);
    return magnitude <= limit ? value : Math.sign(value) * (limit + (magnitude - limit) * 0.34);
  }

  /** Schedules a transition cleanup that is cancelled when this route disconnects. */
  private defer(callback: () => void, duration: number): void {
    const timer = window.setTimeout(() => {
      this.timers = this.timers.filter((pending) => pending !== timer);
      callback();
    }, duration);
    this.timers.push(timer);
  }

  /** Retires the gesture hint after a visitor has used any deck navigation. */
  private retireHint(): void {
    if (this.hintRetired) {
      return;
    }
    this.hintRetired = true;
    this.querySelector<HTMLElement>("[data-reach-out-hint]")?.setAttribute("data-retired", "true");
  }

  /** Renders the client conversation as four short, progressively specific cards. */
  render(): string {
    const { page, cards } = reachOutContent;
    const [firstCard, secondCard, thirdCard, fourthCard] = cards;

    return HTML`
      <section class="reach-out-card-deck" aria-label="${page.label}">
        <div class="reach-out-card-deck__stage layout-content">
          <div class="reach-out__deck" data-reach-out-deck role="group" aria-roledescription="card deck" aria-label="${page.deckAriaLabel}" tabindex="0">
            <article class="reach-out__card reach-out__card--four" data-reach-out-card aria-label="Card ${fourthCard.number} of ${CARD_COUNT}">
              <p class="reach-out__index">${fourthCard.number}</p>
              <div class="reach-out__action">
                <h2>${fourthCard.titleBeforeAccent}<span>${fourthCard.titleAccent}</span>${fourthCard.titleAfterAccent}</h2>
                <p>${fourthCard.body}</p>
                <a class="app-link app-link--button app-link--accent" href="${fourthCard.emailHref}">${fourthCard.emailLabel} <span aria-hidden="true">→</span></a>
                <a class="app-link app-link--text reach-out__home-link" href="/">${fourthCard.homeLabel}</a>
              </div>
            </article>
            <article class="reach-out__card reach-out__card--three" data-reach-out-card aria-label="Card ${thirdCard.number} of ${CARD_COUNT}">
              <p class="reach-out__index">${thirdCard.number}</p>
              <h2>${thirdCard.titleBeforeAccent}<span>${thirdCard.titleAccent}</span>${thirdCard.titleAfterAccent}</h2>
              <p class="reach-out__footnote">${thirdCard.body}</p>
            </article>
            <article class="reach-out__card reach-out__card--two" data-reach-out-card aria-label="Card ${secondCard.number} of ${CARD_COUNT}">
              <p class="reach-out__index">${secondCard.number}</p>
              <h2>${secondCard.titleBeforeAccent}<span>${secondCard.titleAccent}</span>${secondCard.titleAfterAccent}</h2>
              <div class="reach-out__range">
                <div><span>${secondCard.rangeStart}</span><i aria-hidden="true"></i><span>${secondCard.rangeEnd}</span></div>
                <p>${secondCard.body}</p>
              </div>
            </article>
            <article class="reach-out__card reach-out__card--one" data-reach-out-card aria-label="Card ${firstCard.number} of ${CARD_COUNT}">
              <p class="reach-out__index">${firstCard.number}</p>
              <h1>${firstCard.titleBeforeAccent}<span>${firstCard.titleAccent}</span>${firstCard.titleAfterAccent}</h1>
              <p>${firstCard.body}</p>
            </article>
          </div>
          <p class="reach-out__live" data-reach-out-live aria-live="polite" aria-atomic="true"></p>
        </div>
        <footer class="reach-out-card-deck__controls layout-content">
          <div class="reach-out__helm">
            <div class="reach-out__navigation">
              <button class="reach-out__step" data-reach-out-previous type="button" aria-label="${page.previousCardAriaLabel}">←</button>
              <nav class="reach-out__ticks" data-reach-out-ticks aria-label="${page.cardsAriaLabel}"></nav>
              <button class="reach-out__step" data-reach-out-next type="button" aria-label="${page.nextCardAriaLabel}">→</button>
            </div>
            <p class="reach-out__hint" data-reach-out-hint>${page.hint}</p>
          </div>
        </footer>
      </section>
    `;
  }
}

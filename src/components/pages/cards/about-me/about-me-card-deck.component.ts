import { BaseElement, Component, HTML } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { CARD_DECK_INTERACTION, CardDeckMachine } from "@app/components/utils/card-deck/card-deck.machine.ts";

const CARD_TILTS = ["-0.5deg", "0.6deg", "-0.45deg", "0.55deg", "-0.55deg"];

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
 * Turns the About narrative into the same pullable deck used by Reach Out.
 *
 * Content remains specific to the work, while the shared machine owns cyclic
 * navigation and the thresholds that make every deck respond consistently.
 *
 * Selector: `about-me-card-deck`.
 */
@Component({ selector: "about-me-card-deck", shadow: false })
export class AboutMeCardDeckComponent extends BaseElement {
  private machine = new CardDeckMachine(5);
  private abortController: AbortController | null = null;
  private unsubscribe: (() => void) | null = null;
  private cards: HTMLElement[] = [];
  private ticks: HTMLButtonElement[] = [];
  private drag: DragState | null = null;
  private isBusy = false;
  private hintRetired = false;
  private timers: number[] = [];

  @OnEvent("connected", true)
  connectDeck(): void {
    this.machine = new CardDeckMachine(4);
    this.abortController = new AbortController();
    this.cards = Array.from(this.querySelectorAll<HTMLElement>("[data-about-me-deck-card]")).reverse();
    this.cards.forEach((card, index) => card.style.setProperty("--about-me-deck-tilt", CARD_TILTS[index]));
    this.createTicks();
    this.unsubscribe = this.machine.subscribe(() => this.renderDeck());

    const deck = this.querySelector<HTMLElement>("[data-about-me-deck]");
    const previous = this.querySelector<HTMLButtonElement>("[data-about-me-deck-previous]");
    const next = this.querySelector<HTMLButtonElement>("[data-about-me-deck-next]");
    if (!deck || !previous || !next) return;

    const options = { signal: this.abortController.signal };
    previous.addEventListener("click", () => this.showPrevious(), options);
    next.addEventListener("click", () => this.commitNext(1, 0), options);
    deck.addEventListener("keydown", (event) => this.handleKeyboard(event), options);
    deck.addEventListener("pointerdown", (event) => this.startDrag(event), options);
    deck.addEventListener("pointermove", (event) => this.moveDrag(event), options);
    deck.addEventListener("pointerup", (event) => this.endDrag(event), options);
    deck.addEventListener("pointercancel", (event) => this.endDrag(event), options);
  }

  @OnEvent("disconnected", true)
  disconnectDeck(): void {
    this.abortController?.abort();
    this.unsubscribe?.();
    this.timers.forEach((timer) => window.clearTimeout(timer));
    this.abortController = null;
    this.unsubscribe = null;
    this.timers = [];
    this.drag = null;
    this.isBusy = false;
  }

  private createTicks(): void {
    const tickList = this.querySelector<HTMLElement>("[data-about-me-deck-ticks]");
    if (!tickList) return;

    this.ticks = this.cards.map((_, index) => {
      const tick = document.createElement("button");
      tick.type = "button";
      tick.className = "about-me-deck__tick";
      tick.setAttribute("aria-label", `Card ${index + 1} of ${this.machine.count}`);
      tick.addEventListener("click", () => this.goTo(index), { signal: this.abortController?.signal });
      tickList.append(tick);
      return tick;
    });
  }

  private renderDeck(): void {
    this.cards.forEach((card, index) => {
      const depth = this.depthOf(index);
      if (!card.classList.contains("is-leaving")) {
        card.classList.add("is-animated");
        this.setCardPosition(card, depth);
        card.style.removeProperty("--about-me-deck-duration");
      }
      card.classList.toggle("is-top", depth === 0);
      card.toggleAttribute("inert", depth !== 0);
    });
    this.ticks.forEach((tick, index) => tick.setAttribute("aria-current", String(index === this.machine.top)));
    const title = this.cards[this.machine.top]?.querySelector("h1, h2")?.textContent?.trim() ?? "";
    this.querySelector<HTMLElement>("[data-about-me-deck-live]")!.textContent = `Card ${this.machine.top + 1} of ${this.machine.count}. ${title}`;
  }

  private commitNext(direction: number, velocity: number): void {
    if (this.isBusy) return;
    this.isBusy = true;
    const card = this.cards[this.machine.top];
    const duration = Math.round(Math.max(240, Math.min(420, 340 - Math.abs(velocity) * 90)));
    card.classList.add("is-animated", "is-leaving");
    card.style.setProperty("--about-me-deck-duration", `${duration}ms`);
    card.style.setProperty("--about-me-deck-x", `${direction > 0 ? 125 : -125}%`);
    card.style.setProperty("--about-me-deck-y", "40px");
    card.style.setProperty("--about-me-deck-rotation", `${direction > 0 ? 9 : -9}deg`);
    this.machine.next();
    this.defer(() => {
      card.classList.remove("is-leaving");
      this.silently(card, () => this.setCardPosition(card, this.machine.count - 1));
      this.isBusy = false;
    }, duration);
    this.retireHint();
  }

  private showPrevious(): void {
    if (this.isBusy) return;
    this.isBusy = true;
    const card = this.cards[(this.machine.top - 1 + this.machine.count) % this.machine.count];
    card.classList.add("is-incoming");
    this.silently(card, () => {
      this.setCardPosition(card, 0);
      card.style.setProperty("--about-me-deck-x", "-125%");
      card.style.setProperty("--about-me-deck-y", "40px");
      card.style.setProperty("--about-me-deck-rotation", "-9deg");
    });
    this.machine.previous();
    this.defer(() => {
      card.classList.remove("is-incoming");
      this.isBusy = false;
    }, 420);
    this.retireHint();
  }

  private goTo(index: number): void {
    if (this.isBusy || index === this.machine.top) return;
    if (index === (this.machine.top + 1) % this.machine.count) return this.commitNext(1, 0);
    if (index === (this.machine.top - 1 + this.machine.count) % this.machine.count) return this.showPrevious();
    this.machine.select(index);
    this.retireHint();
  }

  private handleKeyboard(event: KeyboardEvent): void {
    const handlers: Record<string, () => void> = {
      ArrowRight: () => this.commitNext(1, 0), ArrowDown: () => this.commitNext(1, 0),
      ArrowLeft: () => this.showPrevious(), ArrowUp: () => this.showPrevious(),
      Home: () => this.goTo(0), End: () => this.goTo(this.machine.count - 1),
    };
    const handler = handlers[event.key];
    if (handler) { event.preventDefault(); handler(); }
  }

  private startDrag(event: PointerEvent): void {
    if (this.isBusy || event.button !== 0) return;
    const card = this.cards[this.machine.top];
    const target = event.target as HTMLElement;
    if (!card.contains(target) || target.closest("a, button")) return;
    const box = card.getBoundingClientRect();
    this.drag = { element: card, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, grabSign: event.clientY - box.top < box.height / 2 ? 1 : -1, timestamp: performance.now(), lastX: event.clientX, velocity: 0, moved: false };
    card.setPointerCapture(event.pointerId);
    card.classList.remove("is-animated");
    card.classList.add("is-grabbed");
  }

  private moveDrag(event: PointerEvent): void {
    if (!this.drag || event.pointerId !== this.drag.pointerId) return;
    const horizontal = event.clientX - this.drag.startX;
    const vertical = event.clientY - this.drag.startY;
    if (!this.drag.moved && Math.abs(horizontal) < 4 && Math.abs(vertical) < 4) return;
    this.drag.moved = true;
    const now = performance.now();
    const elapsed = now - this.drag.timestamp;
    if (elapsed > 8) { this.drag.velocity = (event.clientX - this.drag.lastX) / elapsed; this.drag.lastX = event.clientX; this.drag.timestamp = now; }
    const x = this.resist(horizontal);
    const progress = Math.min(1, Math.abs(horizontal) / CARD_DECK_INTERACTION.swipeThreshold);
    this.drag.element.style.setProperty("--about-me-deck-x", `${x}px`);
    this.drag.element.style.setProperty("--about-me-deck-y", `${this.resist(vertical) * 0.22 - 4}px`);
    this.drag.element.style.setProperty("--about-me-deck-rotation", `${Math.max(-6, Math.min(6, x * 0.045 * this.drag.grabSign))}deg`);
    this.drag.element.style.setProperty("--about-me-deck-dx", `${x}px`);
    this.drag.element.style.setProperty("--about-me-deck-progress", String(progress));
    this.cards.forEach((card, index) => {
      const depth = this.depthOf(index);
      if (depth !== 0) { card.classList.remove("is-animated"); card.style.setProperty("--about-me-deck-depth", String(depth - progress * 0.85)); }
    });
  }

  private endDrag(event: PointerEvent): void {
    if (!this.drag || event.pointerId !== this.drag.pointerId) return;
    const drag = this.drag;
    const distance = event.clientX - drag.startX;
    drag.element.classList.remove("is-grabbed");
    this.drag = null;
    if (!drag.moved) { drag.element.classList.add("is-animated"); return; }
    const commit = Math.abs(distance) > CARD_DECK_INTERACTION.swipeThreshold || (Math.abs(drag.velocity) > CARD_DECK_INTERACTION.flickVelocity && Math.abs(distance) > CARD_DECK_INTERACTION.flickDistance);
    if (commit) return this.commitNext(distance || drag.velocity, drag.velocity);
    this.cards.forEach((card, index) => { card.classList.add("is-animated"); card.style.setProperty("--about-me-deck-duration", "340ms"); this.setCardPosition(card, this.depthOf(index)); });
  }

  private depthOf(index: number): number { return (index - this.machine.top + this.machine.count) % this.machine.count; }

  private setCardPosition(card: HTMLElement, depth: number): void {
    card.style.setProperty("--about-me-deck-depth", String(depth));
    card.style.setProperty("--about-me-deck-x", "0px"); card.style.setProperty("--about-me-deck-y", "0px");
    card.style.setProperty("--about-me-deck-rotation", "0deg"); card.style.setProperty("--about-me-deck-dx", "0px"); card.style.setProperty("--about-me-deck-progress", "0");
  }

  private silently(card: HTMLElement, operation: () => void): void { card.classList.remove("is-animated"); operation(); void card.offsetWidth; card.classList.add("is-animated"); }
  private resist(value: number): number { const magnitude = Math.abs(value); const limit = CARD_DECK_INTERACTION.resistanceLimit; return magnitude <= limit ? value : Math.sign(value) * (limit + (magnitude - limit) * 0.34); }
  private defer(callback: () => void, duration: number): void { const timer = window.setTimeout(() => { this.timers = this.timers.filter((pending) => pending !== timer); callback(); }, duration); this.timers.push(timer); }
  private retireHint(): void { if (!this.hintRetired) { this.hintRetired = true; this.querySelector<HTMLElement>("[data-about-me-deck-hint]")?.setAttribute("data-retired", "true"); } }

  render(): string {
    return this.renderAboutDeck();
  }

  /** Keeps the personal narrative in the shared deck shell without forking its behavior. */
  private renderAboutDeck(): string {
    return HTML`
      <section class="about-me-deck about-me-deck--about layout-section" aria-label="About Ayush">
        <div class="about-me-deck__stage layout-content">
          <div class="about-me-deck__stack" data-about-me-deck role="group" aria-roledescription="card deck" aria-label="Four cards. Use the arrow keys or pull the top card away." tabindex="0">
            <article class="about-me-deck__card about-me-deck__card--about-close" data-about-me-deck-card aria-label="Card 4 of 4">
              <p class="about-me-deck__index">04</p>
              <h2>And I'll tell you what I'd do <span>differently</span>.</h2>
              <p>Early, while it's still cheap to change your mind. It's the most useful thing I can hand anyone, and it costs nothing.</p>
              <div class="about-me-deck__doors">
                <a href="/showcase">See what I've built →</a>
                <a href="/blog">Read what I write →</a>
                <a href="/cards/reach-out">Start something →</a>
              </div>
            </article>
            <article class="about-me-deck__card about-me-deck__card--about-branch" data-about-me-deck-card aria-label="Card 3 of 4">
              <p class="about-me-deck__index">03</p>
              <h2>Then I'll follow it <span>anywhere</span>.</h2>
              <div class="about-me-deck__branch">
                <p>Some weeks that's a queue that won't drain.</p>
                <p>Some weeks it's why a headline breaks at 200% zoom.</p>
                <small>Same itch, different end of the machine.</small>
              </div>
            </article>
            <article class="about-me-deck__card about-me-deck__card--about-build" data-about-me-deck-card aria-label="Card 2 of 4">
              <p class="about-me-deck__index">02</p>
              <h2>Which usually ends with me wondering how I'd have <span>built</span> it.</h2>
              <p>That's how I ended up writing my own component libraries rather than reaching for someone else's.</p>
              <p class="about-me-deck__mono">dota-core · dota-wrap · dota-rest</p>
            </article>
            <article class="about-me-deck__card about-me-deck__card--about-intro" data-about-me-deck-card aria-label="Card 1 of 4">
              <p class="about-me-deck__index">01</p>
              <div>
                <h1>I'm Ayush. I like knowing how things <span>work</span>.</h1>
                <p>Backend engineer, four years in. The curiosity turned up first.</p>
              </div>
            </article>
          </div>
          <p class="about-me-deck__live" data-about-me-deck-live aria-live="polite" aria-atomic="true"></p>
        </div>
        <footer class="about-me-deck__controls layout-content"><div><button type="button" data-about-me-deck-previous aria-label="Previous card">←</button><nav data-about-me-deck-ticks aria-label="Cards"></nav><button type="button" data-about-me-deck-next aria-label="Next card">→</button></div><p data-about-me-deck-hint>Pull the top card away</p></footer>
      </section>`;
  }
}

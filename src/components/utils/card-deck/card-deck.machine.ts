/** Shared interaction thresholds for every pullable card deck. */
export const CARD_DECK_INTERACTION = {
  swipeThreshold: 88,
  flickVelocity: 0.45,
  flickDistance: 24,
  resistanceLimit: 110,
} as const;

export type CardDeckState = {
  top: number;
  count: number;
  direction: -1 | 0 | 1;
};

export type CardDeckObserver = (state: CardDeckState) => void;

/**
 * Holds the bounded position of a card deck independently from its rendering.
 *
 * Reach Out and Showcase subscribe to this same state contract, keeping their
 * pointer, keyboard, tick, and button navigation aligned as either deck evolves.
 */
export class CardDeckMachine {
  private readonly observers = new Set<CardDeckObserver>();
  private currentTop = 0;

  constructor(readonly count: number) {}

  get top(): number {
    return this.currentTop;
  }

  /** Returns whether a later card exists for forward controls and leftward pulls. */
  get canNext(): boolean {
    return this.currentTop < this.count - 1;
  }

  /** Returns whether an earlier card exists for the restored left-arrow control. */
  get canPrevious(): boolean {
    return this.currentTop > 0;
  }

  subscribe(observer: CardDeckObserver): () => void {
    this.observers.add(observer);
    observer(this.state(0));
    return () => this.observers.delete(observer);
  }

  next(): void {
    if (this.canNext) this.go(this.currentTop + 1, 1);
  }

  /**
   * Advances one card and optionally wraps the final card back to the first position.
   *
   * Button navigation uses the bounded {@link next} method. The shared deck lifecycle calls this
   * method for pointer gestures so a visitor can continue swiping through a card story forever.
   *
   * @param wraps - When true, advance from the last card to the first card instead of stopping.
   */
  advance(wraps: boolean): void {
    if (this.canNext) {
      this.go(this.currentTop + 1, 1);
      return;
    }
    if (wraps) this.go(0, 1);
  }

  /** Moves to the preceding card when the left-arrow control is available. */
  previous(): void {
    if (this.canPrevious) this.go(this.currentTop - 1, -1);
  }

  private go(index: number, direction: -1 | 1): void {
    this.currentTop = index;
    this.emit(direction);
  }

  private emit(direction: -1 | 0 | 1): void {
    const state = this.state(direction);
    this.observers.forEach((observer) => observer(state));
  }

  private state(direction: -1 | 0 | 1): CardDeckState {
    return { top: this.currentTop, count: this.count, direction };
  }
}

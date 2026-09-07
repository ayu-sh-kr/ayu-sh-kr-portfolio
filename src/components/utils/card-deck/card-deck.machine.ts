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
 * Holds the cyclic position of a card deck independently from its rendering.
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

  subscribe(observer: CardDeckObserver): () => void {
    this.observers.add(observer);
    observer(this.state(0));
    return () => this.observers.delete(observer);
  }

  next(): void {
    this.go(this.currentTop + 1, 1);
  }

  previous(): void {
    this.go(this.currentTop - 1, -1);
  }

  select(index: number): void {
    const normalized = this.normalize(index);
    if (normalized === this.currentTop) {
      return;
    }

    this.go(normalized, normalized > this.currentTop ? 1 : -1);
  }

  private go(index: number, direction: -1 | 1): void {
    this.currentTop = this.normalize(index);
    this.emit(direction);
  }

  private normalize(index: number): number {
    return (index % this.count + this.count) % this.count;
  }

  private emit(direction: -1 | 0 | 1): void {
    const state = this.state(direction);
    this.observers.forEach((observer) => observer(state));
  }

  private state(direction: -1 | 0 | 1): CardDeckState {
    return { top: this.currentTop, count: this.count, direction };
  }
}

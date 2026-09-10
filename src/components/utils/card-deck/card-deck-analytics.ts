import {
  type AnalyticsCardDeck,
  type AnalyticsCardDeckInput,
  type AnalyticsCardDeckLink,
} from "@app/events/analytics.events.ts";
import { publishAnalyticsEvent } from "@app/utils/analytics.utils.ts";
import { CARD_DECK_INTERACTION } from "./card-deck.machine.ts";

/** Publishes one settled pointer gesture without sending noisy move events. */
export const trackCardDeckSwipe = (
  deck: AnalyticsCardDeck,
  card: number,
  cardCount: number,
  distance: number,
  completed: boolean,
): void => {
  publishAnalyticsEvent({
    eventName: "card_deck_swipe",
    params: {
      deck,
      card,
      card_count: cardCount,
      distance_pixels: Math.round(Math.abs(distance)),
      progress_percent: Math.min(200, Math.round(Math.abs(distance) / CARD_DECK_INTERACTION.swipeThreshold * 100)),
      completed,
    },
  });
};

/** Publishes a card change with enough context to measure deck consumption. */
export const trackCardDeckNavigation = (
  deck: AnalyticsCardDeck,
  input: AnalyticsCardDeckInput,
  fromCard: number,
  toCard: number,
  cardCount: number,
  furthestCardReached: number,
): void => {
  publishAnalyticsEvent({
    eventName: "card_deck_navigation",
    params: {
      deck,
      input,
      from_card: fromCard,
      to_card: toCard,
      card_count: cardCount,
      furthest_card_reached: furthestCardReached,
    },
  });
};

/** Publishes a deck link selection with its role and a stable destination. */
export const trackCardDeckLink = (
  deck: AnalyticsCardDeck,
  link: AnalyticsCardDeckLink,
  destination: string,
  card: number,
  furthestCardReached: number,
): void => {
  publishAnalyticsEvent({
    eventName: "card_deck_link_click",
    params: { deck, link, destination, card, furthest_card_reached: furthestCardReached },
  });
};

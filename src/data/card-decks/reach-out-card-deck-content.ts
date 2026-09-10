import {reachOutContent} from "@app/data/reach-out-content.ts";

/**
 * Renders the direct-contact cards from the route's authored content record.
 *
 * `reach-out-content.ts` remains the source for the wording shared with route SEO. This deck
 * content module owns the deck-specific markup, labels, and stable analytics destinations.
 *
 * @returns Trusted markup for the four Reach Out cards, ordered back-to-front for stacking.
 */
export const renderReachOutCardDeckCards = (): string => {
  const {cards} = reachOutContent;
  const [firstCard, secondCard, thirdCard, fourthCard] = cards;
  return `
    <article class="reach-out__card reach-out__card--four" data-reach-out-card aria-label="Card ${fourthCard.number} of ${cards.length}"><p class="reach-out__index">${fourthCard.number}</p><div class="reach-out__action"><h2>${fourthCard.titleBeforeAccent}<span>${fourthCard.titleAccent}</span>${fourthCard.titleAfterAccent}</h2><p>${fourthCard.body}</p><a class="app-link app-link--button app-link--accent" data-card-deck-link="cta" data-card-deck-destination="email" href="${fourthCard.emailHref}">${fourthCard.emailLabel} <span aria-hidden="true">→</span></a><a class="app-link app-link--text reach-out__home-link" data-card-deck-link="home" data-card-deck-destination="/" href="/">${fourthCard.homeLabel}</a></div></article>
    <article class="reach-out__card reach-out__card--three" data-reach-out-card aria-label="Card ${thirdCard.number} of ${cards.length}"><p class="reach-out__index">${thirdCard.number}</p><h2>${thirdCard.titleBeforeAccent}<span>${thirdCard.titleAccent}</span>${thirdCard.titleAfterAccent}</h2><p class="reach-out__footnote">${thirdCard.body}</p></article>
    <article class="reach-out__card reach-out__card--two" data-reach-out-card aria-label="Card ${secondCard.number} of ${cards.length}"><p class="reach-out__index">${secondCard.number}</p><h2>${secondCard.titleBeforeAccent}<span>${secondCard.titleAccent}</span>${secondCard.titleAfterAccent}</h2><div class="reach-out__range"><div><span>${secondCard.rangeStart}</span><i aria-hidden="true"></i><span>${secondCard.rangeEnd}</span></div><p>${secondCard.body}</p></div></article>
    <article class="reach-out__card reach-out__card--one" data-reach-out-card aria-label="Card ${firstCard.number} of ${cards.length}"><p class="reach-out__index">${firstCard.number}</p><h1>${firstCard.titleBeforeAccent}<span>${firstCard.titleAccent}</span>${firstCard.titleAfterAccent}</h1><p>${firstCard.body}</p></article>`;
};

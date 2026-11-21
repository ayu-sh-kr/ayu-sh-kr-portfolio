import type { PagerVisual } from "../pager-contract.ts";
import { mountStrip, relativePosition } from "./number-strip.ts";

export const storyStack: PagerVisual = {
  id: "story-stack", slots: 3, position: relativePosition,
  mount(surface, c) {
    return mountStrip(surface, c, false, (tile, d, { depth }) => {
      tile.style.transform = `translate(-50%,-50%) translateY(${-6 * Math.exp(-d * d) * depth}px) rotateY(${-d * 12 * depth}deg)`;
      surface.style.setProperty("--stack-depth", String(depth));
    }, (box, page) => {
      const { headlines, count } = c.summarize(page);
      for (const title of headlines) {
        const card = document.createElement("div");
        card.className = "pager-story";
        card.textContent = title;
        box.append(card);
      }
      if (count > headlines.length) {
        const more = document.createElement("small");
        more.textContent = `+${count - headlines.length} more on page ${page}`;
        box.append(more);
      }
    });
  },
};

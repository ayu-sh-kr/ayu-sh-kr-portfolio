import { bound, windowStart, type PagerVisual } from "../pager-contract.ts";
import { mountStrip } from "./number-strip.ts";

export const indexLens: PagerVisual = {
  id: "index-lens", slots: 5,
  position(c, _startX, x) {
    const first = windowStart(c.current, c.slots, c.total);
    return bound(first - .5 + (x - c.left) / Math.max(1, c.width) * c.slots, first, first + c.slots - 1);
  },
  mount(surface, c) {
    return mountStrip(surface, c, true, (tile, d, { depth }) => {
      const lens = Math.exp(-d * d / 1.4) * depth;
      tile.style.transform = `translate(-50%,-50%) translate3d(${Math.sign(d) * 8 * depth}px,${-12 * lens}px,${18 * lens}px) rotateY(${-d * lens * 15}deg) scale(${1 + .42 * lens})`;
    }, (box, page) => { box.textContent = c.summarize(page).dates; });
  },
};

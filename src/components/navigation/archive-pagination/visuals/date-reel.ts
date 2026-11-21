import { bound, windowStart, type PagerVisual } from "../pager-contract.ts";
import { mountStrip, relativePosition } from "./number-strip.ts";

export const dateReel: PagerVisual = {
  id: "date-reel",
  slots: 3,
  caption: summary => summary.dates,
  position: relativePosition,
  mount(surface, context) {
    return mountStrip(surface, context, false, (tile, distance, { position, depth }, pitch) => {
      const angle = bound(distance * .72, -1.6, 1.6);
      const half = (context.slots - 1) / 2;
      const windowCenter = windowStart(position, context.slots, context.total) + half;
      const center = bound(position, 1 + half, context.total - half);
      const travel = Math.sin(angle) / .72 - distance + windowCenter - center;
      const x = travel * pitch * depth;
      const z = (Math.cos(angle) - 1) * pitch * 1.6 * depth;
      tile.style.transform = `translate(-50%,-50%) translate3d(${x}px,0,${z}px) rotateY(${-angle * 58 * depth}deg)`;
    }, (box, page) => { box.textContent = context.summarize(page).dates; });
  },
};

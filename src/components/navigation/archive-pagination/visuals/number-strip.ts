import { bound, windowStart, type MountedVisual, type VisualContext, type VisualFrame } from "../pager-contract.ts";

/** The reel and story stack move relative to the initial touch. */
export function relativePosition(c: VisualContext, startX: number, x: number) {
  return bound(c.current + (startX - x) / Math.max(44, c.width / c.slots), 1, c.total);
}

type DrawTile = (tile: HTMLElement, distance: number, frame: VisualFrame, pitch: number) => void;

/** Draw a bounded set of presentation-only tiles; readers and search engines use the static anchors underneath. */
export function mountStrip(surface: HTMLElement, c: VisualContext, fixedWindow: boolean,
  draw: DrawTile, preview: (box: HTMLElement, page: number) => void): MountedVisual {
  const tiles = Array.from({ length: c.slots }, () => {
    const tile = document.createElement("span");
    tile.className = "archive-key motion-key";
    surface.append(tile);
    return tile;
  });
  const box = document.createElement("div");
  box.className = "pager-preview";
  surface.append(box);
  let previous = 0;
  return {
    update(frame) {
      const selected = Math.round(frame.position);
      const start = windowStart(fixedWindow ? c.current : selected, c.slots, c.total);
      tiles.forEach((tile, slot) => {
        const n = start + slot;
        tile.textContent = String(n);
        tile.classList.toggle("selected", n === selected);
        tile.style.left = ((slot + .5) / c.slots * 100) + "%";
        draw(tile, n - frame.position, frame, c.width / c.slots);
      });
      if (selected !== previous) {
        box.replaceChildren();
        preview(box, selected);
        previous = selected;
      }
    },
    dispose() { surface.remove(); },
  };
}

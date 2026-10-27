import { Component } from "@ayu-sh-kr/dota-wrap/core";
import { html } from "@ayu-sh-kr/dota-wrap/rendering";
import { ArticleShowcaseElement } from "../article-showcase.element.ts";

/**
 * Original hummingbird animation embedded as a compact square article asset.
 * A shaded body, fine beak, fanned tail and feathered wings make the subject
 * recognizable before its character texture. Forty-eight deterministic frames
 * loop through CSS without controls or runtime drawing. Reduced motion retains
 * the first frame. Selector: ui-ascii-showcase; no attributes are required.
 */
@Component({ selector: "ui-ascii-showcase", shadow: false })
export class UiAsciiShowcaseComponent extends ArticleShowcaseElement {
  /** Shades an elliptical body part with a fixed upper-left light and a soft rim. */
  private ellipsoid(x: number, y: number, cx: number, cy: number, rx: number, ry: number, angle = 0): number {
    const dx = x - cx;
    const dy = y - cy;
    const u = (dx * Math.cos(angle) + dy * Math.sin(angle)) / rx;
    const v = (-dx * Math.sin(angle) + dy * Math.cos(angle)) / ry;
    const radius = u * u + v * v;
    if (radius >= 1) return 0;
    const depth = Math.sqrt(1 - radius);
    return Math.min(1, 0.18 + depth * 0.55 - u * 0.15 - v * 0.18);
  }

  /** Samples a tapered wing; narrow longitudinal ridges separate its flight feathers. */
  private wing(x: number, y: number, phase: number, far = false): number {
    const rootX = -0.09;
    const rootY = 0.025;
    const tipX = far ? 0.01 + 0.12 * Math.sin(phase) : -0.56 - 0.08 * Math.sin(phase);
    const tipY = far ? -0.14 - 0.57 * Math.cos(phase - 0.28) : -0.12 - 0.66 * Math.cos(phase);
    const dx = tipX - rootX;
    const dy = tipY - rootY;
    const length = Math.hypot(dx, dy);
    const t = ((x - rootX) * dx + (y - rootY) * dy) / (length * length);
    if (t <= 0 || t >= 1) return 0;
    const across = ((x - rootX) * -dy + (y - rootY) * dx) / length;
    const width = 0.155 * Math.pow(Math.sin(t * Math.PI), 0.72);
    const edge = across / width;
    if (Math.abs(edge) >= 1) return 0;
    const feathers = 0.5 + 0.5 * Math.cos((edge + t * 0.4) * 23);
    const light = 0.18 + 0.3 * (1 - Math.abs(edge)) + 0.25 * feathers;
    return light * (far ? 0.58 : 1);
  }

  /** Composes the bird in depth order, keeping the eye, beak and split tail legible. */
  private frame(phase: number): string {
    const ramp = " .,:;irsx%#@";
    const bob = 0.025 * Math.sin(phase * 2);
    return Array.from({ length: 64 }, (_, row) =>
      Array.from({ length: 96 }, (_, col) => {
        const x = (col + 0.5) / 48 - 1;
        const y = (row + 0.5) / 32 - 1 - bob;
        let light = this.wing(x, y, phase, true);
        // A narrow fan extends from the rump and resolves into three tail feathers.
        for (let feather = 0; feather < 3; feather++) {
          const endX = -0.69 + feather * 0.065;
          const endY = 0.32 + feather * 0.09;
          const dx = endX + 0.22;
          const dy = endY - 0.15;
          const t = ((x + 0.22) * dx + (y - 0.15) * dy) / (dx * dx + dy * dy);
          const distance = Math.abs((x + 0.22) * dy - (y - 0.15) * dx) / Math.hypot(dx, dy);
          if (t > 0 && t < 1 && distance < 0.029 * Math.sin(t * Math.PI)) {
            light = Math.max(light, 0.42 + 0.22 * (1 - t));
          }
        }
        const body = this.ellipsoid(x, y, -0.075, 0.115, 0.285, 0.155, -0.42);
        const chest = this.ellipsoid(x, y, 0.105, 0.07, 0.13, 0.145, -0.35);
        const head = this.ellipsoid(x, y, 0.225, -0.035, 0.125, 0.115, -0.2);
        light = Math.max(light, body, chest, head);
        light = Math.max(light, this.wing(x, y, phase));
        // The tapered beak and dark eye distinguish the silhouette from an abstract wing study.
        if (x > 0.31 && x < 0.72 && Math.abs(y + 0.047) < 0.004 + 0.012 * (0.72 - x) / 0.41) {
          light = 0.75;
        }
        if ((x - 0.265) ** 2 + (y + 0.058) ** 2 < 0.00048) light = 0.06;
        return ramp[Math.min(ramp.length - 1, Math.floor(light * ramp.length))];
      }).join("")
    ).join("\n");
  }

  /** Renders one accessible bird study with an automatic four-second loop and no playback UI. */
  render() {
    return html`<figure class="ui-ascii-study">
      <div class="ui-ascii-stage" role="img" aria-label="Animated ASCII hummingbird hovering in profile, with feathered wings, a fine beak and a fanned tail.">
        ${Array.from({ length: 48 }, (_, index) => html`<pre aria-hidden="true" style="animation-delay: ${-((48 - index) % 48) / 12}s">${this.frame(index * Math.PI / 24)}</pre>`)}
      </div>
      <figcaption>A hummingbird in flight, drawn entirely with characters. Original animation.</figcaption>
    </figure>`;
  }
}

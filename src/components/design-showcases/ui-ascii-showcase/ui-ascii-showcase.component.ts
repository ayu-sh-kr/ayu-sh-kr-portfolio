import { Component } from "@ayu-sh-kr/dota-wrap/core";
import { html } from "@ayu-sh-kr/dota-wrap/rendering";
import { ArticleShowcaseElement } from "../article-showcase.element.ts";

/**
 * Original character-shaded globe for the ASCII design Dispatch.
 * Sixteen deterministic frames are rendered during SSG and replayed by CSS, so
 * hydration needs no timer, canvas, network call or randomly generated state.
 * A native checkbox pauses motion; reduced motion retains the first frame.
 * Selector: ui-ascii-showcase. No attributes are required.
 */
@Component({ selector: "ui-ascii-showcase", shadow: false })
export class UiAsciiShowcaseComponent extends ArticleShowcaseElement {
  /** Builds a lit sphere with longitude bands; all marks are printable ASCII. */
  private frame(phase: number): string {
    const ramp = " .,:;ox%#@";
    return Array.from({ length: 24 }, (_, row) =>
      Array.from({ length: 64 }, (_, col) => {
        const x = (col - 31.5) / 24;
        const y = (row - 11.5) / 11;
        const radius = x * x + y * y;
        if (radius > 1) return " ";
        const z = Math.sqrt(1 - radius);
        const longitude = Math.atan2(x, z) + phase;
        const bands = 0.5 + 0.5 * Math.sin(longitude * 7 + Math.sin(y * 5));
        const light = Math.max(0, -0.4 * x - 0.3 * y + 0.85 * z);
        const tone = Math.min(1, light * (0.45 + 0.55 * bands));
        return ramp[Math.round(tone * (ramp.length - 1))];
      }).join("")
    ).join("\n");
  }

  /** Emits the same sixteen frames on server and browser, with a quiet image label. */
  render() {
    return html`<figure class="ui-ascii-study">
      <label class="ui-ascii-control"><input type="checkbox" /> Pause animation
        <span class="ui-ascii-stage" role="img" aria-label="Original ASCII sphere with rotating bands and a light source at the upper left.">
          ${Array.from({ length: 16 }, (_, index) => html`<pre aria-hidden="true" style="animation-delay: ${-index / 8}s">${this.frame(index * Math.PI / 56)}</pre>`)}
        </span>
      </label>
      <figcaption>Light, curvature and rotation, drawn with ten ordinary characters. Original study for this article.</figcaption>
    </figure>`;
  }
}

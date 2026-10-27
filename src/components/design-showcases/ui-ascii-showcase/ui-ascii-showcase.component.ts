import { Component } from "@ayu-sh-kr/dota-wrap/core";
import { OnEvent } from "@ayu-sh-kr/dota-wrap/event";
import { html } from "@ayu-sh-kr/dota-wrap/rendering";
import { ArticleShowcaseElement } from "../article-showcase.element.ts";
import { AsciiWoodland } from "./ascii-woodland.ts";

/**
 * Compact original ASCII woodland for the animation article. Three detailed
 * birds share a colored tree and meadow; a low-resolution painting supplies
 * colors for actual canvas text glyphs. One canvas replaces serialized frame
 * stacks. Playback stops offscreen and reduced motion keeps a still scene.
 * Selector: ui-ascii-showcase; no attributes or reader controls.
 */
@Component({ selector: "ui-ascii-showcase", shadow: false })
export class UiAsciiShowcaseComponent extends ArticleShowcaseElement {
  private animationId = 0;
  private observer: IntersectionObserver | null = null;
  private motion: MediaQueryList | null = null;
  private visible = true;
  private lastPaint = -Infinity;
  private readonly artwork = new AsciiWoodland();
  private source: CanvasRenderingContext2D | null = null;
  private output: CanvasRenderingContext2D | null = null;

  /** Starts only after Dota has mounted the one canvas; SSG has no drawing context. */
  @OnEvent("connected", true)
  startScene(): void {
    if (import.meta.env.SSR) return;
    this.stopScene();
    const canvas = this.querySelector("canvas");
    this.output = canvas?.getContext("2d") ?? null;
    if (!this.output) return;
    const source = document.createElement("canvas");
    source.width = 144;source.height = 96;
    this.source = source.getContext("2d", { willReadFrequently: true });
    this.motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.motion.addEventListener("change", this.restartPlayback);
    this.drawScene(0);
    this.observer = new IntersectionObserver(entries => {
      this.visible = entries[0]?.isIntersecting ?? false;
      this.restartPlayback();
    });
    this.observer.observe(this);
  }

  /** Cancels the loop before a visibility or accessibility change starts another. */
  private readonly restartPlayback = (): void => {
    cancelAnimationFrame(this.animationId);
    this.animationId = 0;
    if (this.motion?.matches) this.drawScene(0);
    else if (this.visible && this.isConnected) this.animationId = requestAnimationFrame(this.tick);
  };

  /** Limits redraws to twelve per second while keeping motion tied to elapsed time. */
  private readonly tick = (time: number): void => {
    if (!this.isConnected || !this.visible || this.motion?.matches) return;
    if (time - this.lastPaint >= 1000 / 12) {
      this.drawScene(time / 1000);
      this.lastPaint = time;
    }
    this.animationId = requestAnimationFrame(this.tick);
  };

  /** Samples the original painting into a 144 by 96 grid of colored ASCII glyphs. */
  private drawScene(time: number): void {
    const source = this.source, output = this.output;
    if (!source || !output) return;
    source.setTransform(144 / 600,0,0,96 / 600,0,0);
    this.artwork.paint(source,time);
    const pixels = source.getImageData(0,0,144,96).data;
    output.clearRect(0,0,864,864);
    output.font = '600 10px monospace';
    output.textBaseline = 'top';
    const ramp = '.,:;=+*ox%#@';
    for(let row=0;row<96;row++)for(let col=0;col<144;col++) {
      const i=(row*144+col)*4;
      const alpha=pixels[i+3]/255;
      if(alpha<0.12)continue;
      const light=(pixels[i]*0.21+pixels[i+1]*0.72+pixels[i+2]*0.07)/255;
      const texture = ((col * 17 + row * 31) % 13) / 13;
      const density=Math.min(0.99,(0.24+light*0.64+texture*0.16)*alpha);
      output.fillStyle=`rgba(${Math.min(255,pixels[i]*1.55+15)},${Math.min(255,pixels[i+1]*1.45+15)},${Math.min(255,pixels[i+2]*1.4+15)},${Math.min(1,alpha+0.25)})`;
      output.fillText(ramp[Math.floor(density*ramp.length)],col*6,row*9);
    }
  }

  /** Releases every observer, media listener and frame when Markdown replaces the scene. */
  @OnEvent("disconnected", true)
  stopScene(): void {
    cancelAnimationFrame(this.animationId);
    this.animationId = 0;
    this.observer?.disconnect();this.observer = null;
    this.motion?.removeEventListener("change", this.restartPlayback);this.motion = null;
    this.source = null;this.output = null;
    this.lastPaint = -Infinity;
  }

  /** Keeps the artwork in one square figure without playback or illustration controls. */
  render() {
    return html`<figure class="ui-ascii-study">
      <div class="ui-ascii-stage">
        <canvas width="864" height="864" role="img" aria-label="Colorful ASCII woodland: two hummingbirds fly above a third bird perched in a leafy tree, with wildflowers and swaying grass below.">Three colorful birds, a branching tree and a wildflower meadow, drawn with text characters.</canvas>
      </div>
      <figcaption>Wingbeats above the meadow. Three birds, a tree and wildflowers, drawn in colored ASCII.</figcaption>
    </figure>`;
  }
}

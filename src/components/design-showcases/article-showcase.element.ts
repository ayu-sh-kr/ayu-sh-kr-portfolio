import { BaseElement } from "@ayu-sh-kr/dota-wrap/core";

/**
 * Defers article illustration mounting until its serialized children exist.
 * A microtask is enough for Markdown fragment insertion, but a streaming HTML
 * parser can yield between the opening custom-element tag and its children.
 * During initial browser parsing, wait for DOMContentLoaded before hydration;
 * otherwise mounting early leaves both new and subsequently parsed figures.
 */
export abstract class ArticleShowcaseElement extends BaseElement {
  private connectionGeneration = 0;
  private parserReady: (() => void) | null = null;

  /** Mounts the latest connection after parsing, without delaying SSG rendering. */
  override connectedCallback(): void {
    const generation = ++this.connectionGeneration;
    const mount = () => queueMicrotask(() => {
      if (this.isConnected && generation === this.connectionGeneration) {
        super.connectedCallback();
      }
    });
    if (!import.meta.env.SSR && this.ownerDocument.readyState === "loading") {
      this.parserReady = () => {
        this.parserReady = null;
        mount();
      };
      this.ownerDocument.addEventListener("DOMContentLoaded", this.parserReady, { once: true });
    } else mount();
  }

  /** Cancels a pending parse listener and invalidates work when Markdown replaces us. */
  override disconnectedCallback(): void {
    this.connectionGeneration++;
    if (this.parserReady) {
      this.ownerDocument.removeEventListener("DOMContentLoaded", this.parserReady);
      this.parserReady = null;
    }
    super.disconnectedCallback();
  }
}

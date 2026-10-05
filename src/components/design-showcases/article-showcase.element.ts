import { BaseElement } from "@ayu-sh-kr/dota-wrap/core";

/**
 * Lets serialized article children finish parsing before Dota mounts or hydrates.
 * Registered showcases can connect while a Markdown HTML insertion is still
 * adding their server-rendered children. A synchronous mount would then leave
 * its new figure alongside the later parsed copy. The microtask keeps those
 * children available to the normal framework mount strategy instead.
 */
export abstract class ArticleShowcaseElement extends BaseElement {
  private connectionGeneration = 0;

  /** Mounts only the most recent connection, after the current insertion completes. */
  override connectedCallback(): void {
    const generation = ++this.connectionGeneration;
    queueMicrotask(() => {
      if (this.isConnected && generation === this.connectionGeneration) {
        super.connectedCallback();
      }
    });
  }

  /** Invalidates a pending mount before releasing the framework's connection state. */
  override disconnectedCallback(): void {
    this.connectionGeneration++;
    super.disconnectedCallback();
  }
}

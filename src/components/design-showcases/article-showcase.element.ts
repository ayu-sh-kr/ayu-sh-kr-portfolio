import { BaseElement } from "@ayu-sh-kr/dota-wrap/core";

/**
 * Lets serialized article children finish parsing before Dota mounts or hydrates.
 * Registered showcases can connect while the document parser is still adding
 * their server-rendered children. Wait for DOMContentLoaded in that case; a
 * microtask alone can run before the parser reaches the closing tag. These
 * purely visual components need no client mount when SSG supplied the figure.
 */
export abstract class ArticleShowcaseElement extends BaseElement {
  private connectionGeneration = 0;
  private pendingMount: (() => void) | null = null;

  /** Mounts only the most recent connection after its children have parsed. */
  override connectedCallback(): void {
    const generation = ++this.connectionGeneration;
    const mount = () => {
      this.pendingMount = null;
      queueMicrotask(() => {
        if (this.isConnected && generation === this.connectionGeneration) {
          if (this.hasAttribute("data-dh-c") && Array.from(this.children).some(child => child.tagName === "FIGURE")) {
            return;
          }
          super.connectedCallback();
        }
      });
    };
    this.pendingMount = mount;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mount, { once: true });
    } else {
      mount();
    }
  }

  /** Invalidates a pending mount before releasing the framework's connection state. */
  override disconnectedCallback(): void {
    this.connectionGeneration++;
    if (this.pendingMount) {
      document.removeEventListener("DOMContentLoaded", this.pendingMount);
      this.pendingMount = null;
    }
    super.disconnectedCallback();
  }
}

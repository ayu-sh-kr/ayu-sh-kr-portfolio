import {MD_RENDERED_EVENT, type MdRenderedDetail} from "@ayu-sh-kr/dota-md";
import {copyArticleCode, decorateArticleCode} from "@app/components/utils/article-code/article-code.utils.ts";

/** One installation per document, including the isolated documents used by SSG. */
const installations = new WeakMap<Document, () => void>();

/**
 * Installs portfolio code presentation for every md-view in this document.
 * Start before application initialization so render events are decorated before
 * page-specific handlers run. The observer covers adopted HTML and views added
 * later without a render event. Copy clicks are delegated once for all views.
 * Returns an idempotent cleanup function for tests and development hot reload.
 */
export function startMarkdownCode(root: Document = document): () => void {
  const existing = installations.get(root);
  if (existing) {
    return existing;
  }

  /** Enhances a rendered view synchronously, before host-specific restructuring. */
  const onRendered = (event: Event): void => {
    const view = event.target;
    const container = (event as CustomEvent<MdRenderedDetail>).detail?.container;
    if (view instanceof HTMLElement && view.matches("md-view")
      && container instanceof HTMLElement && view.contains(container)) {
      decorateArticleCode(container);
    }
  };

  /** Limits document-wide clipboard delegation to controls inside Markdown views. */
  const onCopy = (event: Event): void => {
    if (event.target instanceof Element
      && event.target.closest("md-view [data-article-code-copy]")) {
      void copyArticleCode(event);
    }
  };

  /** Covers new/adopted light-DOM views that have no Markdown render result to emit. */
  const observer = new MutationObserver((records) => {
    const views = new Set<HTMLElement>();
    records.forEach((record) => {
      record.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) {
          return;
        }
        if (node.matches("md-view")) {
          views.add(node);
        }
        node.querySelectorAll<HTMLElement>("md-view").forEach((view) => views.add(view));
        if (node.matches("pre") || node.querySelector("pre")) {
          const view = node.closest<HTMLElement>("md-view");
          if (view) {
            views.add(view);
          }
        }
      });
    });
    views.forEach((view) => decorateArticleCode(view));
  });

  root.addEventListener(MD_RENDERED_EVENT, onRendered, true);
  root.addEventListener("click", onCopy);
  observer.observe(root, {childList: true, subtree: true});
  root.querySelectorAll<HTMLElement>("md-view").forEach((view) => decorateArticleCode(view));

  /** Releases only this document's listeners; repeated cleanup is harmless. */
  const stop = (): void => {
    if (installations.get(root) !== stop) {
      return;
    }
    root.removeEventListener(MD_RENDERED_EVENT, onRendered, true);
    root.removeEventListener("click", onCopy);
    observer.disconnect();
    installations.delete(root);
  };
  installations.set(root, stop);
  return stop;
}

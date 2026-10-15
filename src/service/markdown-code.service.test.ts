import {afterEach, describe, expect, it, vi} from "vitest";
import {MD_RENDERED_EVENT} from "@ayu-sh-kr/dota-md";
import {startMarkdownCode} from "./markdown-code.service.ts";

/** Installs app-wide behavior once per test and releases it afterward. */
let stop: (() => void) | undefined;
const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");

afterEach(() => {
  stop?.();
  stop = undefined;
  document.body.replaceChildren();
  if (clipboardDescriptor) {
    Object.defineProperty(navigator, "clipboard", clipboardDescriptor);
  } else {
    Reflect.deleteProperty(navigator, "clipboard");
  }
});

/** Allows MutationObserver delivery for authored views without a render event. */
const flushMutations = async (): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 10));
};

describe("document-wide Markdown code presentation", () => {
  it("enhances adopted legal and arbitrary Markdown views while leaving other pre elements alone", () => {
    document.body.innerHTML = '<privacy-markdown-view><md-view><pre><code>policy</code></pre></md-view></privacy-markdown-view><section><md-view><pre><code>other view</code></pre></md-view></section><pre><code>outside</code></pre>';
    stop = startMarkdownCode();
    expect(document.querySelectorAll(".article-code")).toHaveLength(2);
    expect(document.body.lastElementChild?.tagName).toBe("PRE");
  });

  it("decorates render events before page-specific listeners and tolerates repeated renders", () => {
    stop = startMarkdownCode();
    const view = document.createElement("md-view");
    const container = document.createElement("div");
    container.innerHTML = '<pre><code class="language-ts">const x = 1;</code></pre>';
    view.append(container);
    document.body.append(view);
    const onRendered = vi.fn(() => expect(container.querySelectorAll(".article-code")).toHaveLength(1));
    view.addEventListener(MD_RENDERED_EVENT, onRendered);
    for (let index = 0; index < 2; index++) {
      view.dispatchEvent(new CustomEvent(MD_RENDERED_EVENT, {bubbles: true, detail: {container}}));
    }
    expect(onRendered).toHaveBeenCalledTimes(2);
    expect(container.querySelectorAll("button")).toHaveLength(1);
  });

  it("handles future authored views and replacement content without host handlers", async () => {
    stop = startMarkdownCode();
    const section = document.createElement("section");
    section.innerHTML = '<md-view><pre data-code-variant="focus" data-highlight-lines="1"><code>first\n</code></pre></md-view>';
    document.body.append(section);
    await flushMutations();
    expect(section.querySelector(".is-highlighted")?.textContent).toBe("first");
    section.querySelector("md-view")!.innerHTML = '<div><pre><code>replacement</code></pre></div>';
    await flushMutations();
    expect(section.querySelectorAll(".article-code")).toHaveLength(1);
    expect(section.querySelector("code")?.textContent).toBe("replacement");
  });

  it("delegates copy once across views and ignores controls outside md-view", async () => {
    document.body.innerHTML = '<md-view><pre><code>copy this</code></pre></md-view><button data-article-code-copy>outside</button>';
    stop = startMarkdownCode();
    expect(startMarkdownCode()).toBe(stop);
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {configurable: true, value: {writeText}});
    document.querySelector<HTMLElement>("dota-icon")!.click();
    await Promise.resolve();
    expect(writeText).toHaveBeenCalledExactlyOnceWith("copy this");
    expect(document.querySelector("[role=status]")?.textContent).toBe("Copied");
    document.body.querySelector<HTMLButtonElement>(":scope > button")!.click();
    expect(writeText).toHaveBeenCalledTimes(1);
  });

  it("releases listeners and observers on cleanup and supports a fresh installation", async () => {
    stop = startMarkdownCode();
    stop();
    stop();
    document.body.innerHTML = '<md-view><pre><code>later</code></pre></md-view>';
    await flushMutations();
    expect(document.querySelector(".article-code")).toBeNull();
    stop = startMarkdownCode();
    expect(document.querySelector(".article-code")).not.toBeNull();
  });
});

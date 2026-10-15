import {MDService} from "@ayu-sh-kr/dota-md";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {copyArticleCode, decorateArticleCode} from "./article-code.utils.ts";

/** Rendered Markdown fixture, scoped to a single article. */
let article: HTMLElement;
const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");

beforeEach(() => {
  article = document.createElement("article");
  document.body.replaceChildren(article);
});

afterEach(() => {
  if (clipboardDescriptor) {
    Object.defineProperty(navigator, "clipboard", clipboardDescriptor);
  } else {
    Reflect.deleteProperty(navigator, "clipboard");
  }
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});

describe("article code blocks", () => {
  it("decorates fenced code once while preserving syntax and source", () => {
    article.innerHTML = '<pre><code class="hljs language-ts"><span class="hljs-keyword">const</span> a = 1;\n</code></pre>';
    decorateArticleCode(article);
    decorateArticleCode(article);
    expect(article.querySelectorAll(".article-code")).toHaveLength(1);
    expect(article.querySelector(".article-code")?.getAttribute("data-variant")).toBe("editorial");
    expect(article.querySelector(".hljs-keyword")?.textContent).toBe("const");
    expect(article.querySelector("code")?.textContent).toBe("const a = 1;\n");
    expect(article.querySelector("button")?.getAttribute("aria-label")).toBe("Copy code");
    expect(article.querySelector("pre")?.tabIndex).toBe(0);
  });

  it("preserves nested multiline tokens, blank lines, and the trailing newline in Focus", () => {
    article.innerHTML = '<pre data-code-variant="focus" data-highlight-lines="2-3,5,invalid" data-filename="sample.ts"><code class="language-ts"><span class="hljs-comment">/* first\n<span>second</span> */</span>\n\nconst x = 1;\n</code></pre>';
    const source = article.querySelector("code")!.textContent;
    decorateArticleCode(article);
    expect(article.querySelector("code")?.textContent).toBe(source);
    expect(article.querySelectorAll(".article-code-line")).toHaveLength(4);
    expect(article.querySelectorAll(".is-highlighted")).toHaveLength(2);
    const lines = article.querySelectorAll(".article-code-line");
    expect(lines[0]?.querySelector(".hljs-comment")?.textContent).toBe("/* first");
    expect(lines[1]?.textContent).toBe("second */");
    expect(lines[1]?.querySelector(".hljs-comment span")?.textContent).toBe("second");
    expect(article.querySelector(".article-code-filename")?.textContent).toBe("sample.ts");
  });

  it("supports highlighted Markdown fences inside a Focus wrapper", () => {
    article.innerHTML = MDService.renderHtml([
      '<div data-code-variant="focus" data-filename="example.ts" data-highlight-lines="1">',
      '', '```ts', 'const value = 42;', '```', '', '</div>',
    ].join("\n"));
    decorateArticleCode(article);
    expect(article.querySelector('.article-code[data-variant="focus"]')).not.toBeNull();
    expect(article.querySelector(".hljs-keyword")?.textContent).toBe("const");
    expect(article.querySelector(".is-highlighted")?.textContent).toBe("const value = 42;");
    expect(article.querySelector(".article-code-filename")?.textContent).toBe("example.ts");
  });

  it("shows an authored filename as a compact hint with its full path available", () => {
    article.innerHTML = '<pre data-filename="src/config/subscriber.ts"><code class="language-ts">const x = 1;</code></pre>';
    decorateArticleCode(article);
    const hint = article.querySelector<HTMLElement>(".article-code-filename");
    expect(hint?.textContent).toBe("subscriber.ts");
    expect(hint?.title).toBe("src/config/subscriber.ts");
    expect(hint?.getAttribute("aria-label")).toBe("src/config/subscriber.ts");
    expect(article.querySelector(".article-code-language")?.textContent).toBe("ts");
  });

  it("handles Minimal, unknown variants, and untagged code safely", () => {
    article.innerHTML = '<pre data-code-variant="minimal"><code>x</code></pre><pre data-code-variant="oops"><code>y</code></pre><pre>plain</pre>';
    decorateArticleCode(article);
    expect([...article.querySelectorAll<HTMLElement>(".article-code")].map((block) => block.dataset.variant))
      .toEqual(["minimal", "editorial"]);
    expect(article.querySelector(".article-code-label")?.textContent).toBe("Code");
    expect(article.lastElementChild?.textContent).toBe("plain");
  });

  it("copies source only and waits for clipboard success before announcing it", async () => {
    article.innerHTML = '<pre data-code-variant="focus"><code class="language-js">const a = 1;\n</code></pre>';
    decorateArticleCode(article);
    let resolveCopy!: () => void;
    const writeText = vi.fn(() => new Promise<void>((resolve) => { resolveCopy = resolve; }));
    Object.defineProperty(navigator, "clipboard", {configurable: true, value: {writeText}});
    const button = article.querySelector("button")!;
    const event = {target: button.firstElementChild} as unknown as Event;
    const copying = copyArticleCode(event);
    expect(writeText).toHaveBeenCalledWith("const a = 1;\n");
    expect(button.disabled).toBe(true);
    expect(article.querySelector("[role=status]")?.textContent).toBe("");
    resolveCopy();
    await copying;
    expect(button.disabled).toBe(false);
    expect(article.querySelector("[role=status]")?.textContent).toBe("Copied");
    expect(article.querySelector("dota-icon")).not.toBeNull();
  });

  it("does not report clipboard failure as success", async () => {
    article.innerHTML = '<pre><code>select me</code></pre>';
    decorateArticleCode(article);
    Object.defineProperty(navigator, "clipboard", {configurable: true, value: {writeText: vi.fn().mockRejectedValue(new Error("denied"))}});
    const button = article.querySelector("button")!;
    await copyArticleCode({target: button} as unknown as Event);
    expect(article.querySelector("[role=status]")?.textContent).toBe("Select the code to copy");
    expect(button.disabled).toBe(false);
  });
});

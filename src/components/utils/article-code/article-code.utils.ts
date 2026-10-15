/**
 * Enhances rendered Markdown without reparsing it. The document-wide Markdown
 * service applies this to every md-view, including adopted SSG markup.
 * Authors can set data-code-variant, data-filename, and data-highlight-lines
 * on a pre element or its Markdown wrapper. Ordinary fences use Editorial.
 */
export function decorateArticleCode(container: HTMLElement): void {
  container.querySelectorAll<HTMLPreElement>("pre").forEach((pre) => {
    const code = pre.querySelector("code");
    if (!code || pre.closest(".article-code")) {
      return;
    }

    const options = pre.closest<HTMLElement>("[data-code-variant]") ?? pre;
    const variant = ["focus", "minimal"].includes(options.dataset.codeVariant ?? "")
      ? options.dataset.codeVariant!
      : "editorial";
    const language = [...code.classList].find((name) => name.startsWith("language-"))?.slice(9) ?? "Code";
    const block = document.createElement("div");
    block.className = "article-code";
    block.dataset.variant = variant;
    const header = document.createElement("div");
    header.className = "article-code-header";
    const label = document.createElement("span");
    label.className = "article-code-label";
    const filename = options.dataset.filename?.trim();
    if (filename) {
      const hint = document.createElement("span");
      hint.className = "article-code-filename";
      hint.textContent = filename.split(/[\\/]/).at(-1) ?? filename;
      hint.title = filename;
      hint.setAttribute("aria-label", filename);
      label.append(hint, document.createTextNode(" "));
    }
    const languageHint = document.createElement("span");
    languageHint.className = "article-code-language";
    languageHint.textContent = language;
    label.append(languageHint);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "article-code-copy";
    button.dataset.articleCodeCopy = "true";
    button.setAttribute("aria-label", "Copy code");
    button.title = "Copy code";
    const icon = document.createElement("dota-icon");
    icon.setAttribute("name", "lucide:copy");
    icon.setAttribute("size", "sm");
    icon.setAttribute("aria-hidden", "true");
    button.append(icon);
    const status = document.createElement("span");
    status.className = "article-code-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    header.append(label, status, button);
    pre.replaceWith(block);
    block.append(header, pre);
    pre.tabIndex = 0;
    pre.setAttribute("aria-label", `${language} code example`);
    if (variant === "focus") {
      decorateCodeLines(code, options.dataset.highlightLines ?? "");
    }
  });
}

/**
 * Splits highlighted DOM at newlines while retaining nested syntax spans.
 * Newlines remain text nodes so selection and clipboard preserve the source.
 * The gutter uses CSS counters and is excluded from the copied text.
 */
function decorateCodeLines(code: HTMLElement, highlights: string): void {
  const ranges = highlights.split(",").map((part) => part.trim().match(/^(\d+)(?:-(\d+))?$/))
    .filter((match) => match !== null)
    .map((match) => [Number(match[1]), Number(match[2] ?? match[1])] as const);
  const lines: HTMLElement[] = [];
  let line = document.createElement("span");
  line.className = "article-code-line";
  lines.push(line);

  /** Recreates each text node's ancestor path when a multiline token crosses lines. */
  const appendNode = (node: Node, ancestors: Element[]): void => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      node.childNodes.forEach((child) => appendNode(child, [...ancestors, node as Element]));
      return;
    }
    if (node.nodeType !== Node.TEXT_NODE) {
      return;
    }
    (node.textContent ?? "").split("\n").forEach((text, index) => {
      if (index > 0) {
        line = document.createElement("span");
        line.className = "article-code-line";
        lines.push(line);
      }
      if (!text) {
        return;
      }
      let parent = line;
      ancestors.forEach((ancestor) => {
        const clone = ancestor.cloneNode(false) as HTMLElement;
        parent.append(clone);
        parent = clone;
      });
      parent.append(document.createTextNode(text));
    });
  };
  code.childNodes.forEach((node) => appendNode(node, []));
  const trailingNewline = lines.length > 1 && lines.at(-1)?.textContent === "";
  if (trailingNewline) {
    lines.pop();
  }
  code.replaceChildren();
  lines.forEach((element, index) => {
    if (index > 0) {
      code.append("\n");
    }
    if (ranges.some(([start, end]) => index + 1 >= start && index + 1 <= end)) {
      element.classList.add("is-highlighted");
    }
    code.append(element);
  });
  if (trailingNewline) {
    code.append("\n");
  }
}

/**
 * Copies only source text and reports success after the clipboard resolves.
 * Feedback mutates this block directly, avoiding a host rerender. A failed copy
 * leaves the example intact and explains how to copy it manually.
 */
export async function copyArticleCode(event: Event): Promise<void> {
  const button = (event.target as Element | null)?.closest<HTMLButtonElement>("[data-article-code-copy]");
  const block = button?.closest<HTMLElement>(".article-code");
  const code = block?.querySelector("code");
  const status = block?.querySelector<HTMLElement>(".article-code-status");
  if (!button || !code || !status || button.disabled) {
    return;
  }

  button.disabled = true;
  status.textContent = "";
  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error("Clipboard unavailable");
    }
    await navigator.clipboard.writeText(code.textContent ?? "");
    status.textContent = "Copied";
  } catch {
    status.textContent = "Select the code to copy";
  } finally {
    button.disabled = false;
  }
}

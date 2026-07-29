#!/usr/bin/env node

const args = process.argv.slice(2);

const option = (name, fallback = "") => {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1] ?? fallback;
};

const selector = option("--selector");
const pageUrl = option("--page-url");
const cdpUrl = option("--cdp-url", "http://127.0.0.1:9222");
const properties = option(
  "--properties",
  "display,width,inlineSize,minInlineSize,maxInlineSize,fontSize,letterSpacing,lineHeight,whiteSpace,wordBreak,overflowWrap,writingMode,transform,position,overflow",
)
  .split(",")
  .map((property) => property.trim())
  .filter(Boolean);

if (!selector) {
  console.error("Usage: inspect-computed-styles.mjs --selector <css-selector> [--page-url <url-fragment>] [--cdp-url <url>] [--properties <comma-list>]");
  process.exit(1);
}

const pages = await fetch(new URL("/json/list", cdpUrl)).then((response) => response.json());
const page = pages.find((candidate) => candidate.type === "page" && (!pageUrl || candidate.url.includes(pageUrl)))
  ?? pages.find((candidate) => candidate.type === "page" && candidate.url.startsWith("http"));

if (!page?.webSocketDebuggerUrl) {
  console.error("No inspectable HTTP page found. Start a Chromium-based browser with --remote-debugging-port.");
  process.exit(1);
}

const expression = `(() => {
  const selector = ${JSON.stringify(selector)};
  const properties = ${JSON.stringify(properties)};
  const describe = (node) => {
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return {
      tag: node.tagName.toLowerCase(),
      classes: node.className,
      text: node.textContent?.trim(),
      rect: {x: rect.x, y: rect.y, width: rect.width, height: rect.height},
      styles: Object.fromEntries(properties.map((property) => [property, style[property]])),
    };
  };
  return [...document.querySelectorAll(selector)].map((node) => ({
    element: describe(node),
    parent: node.parentElement ? describe(node.parentElement) : null,
  }));
})()`;

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, {once: true});
  socket.addEventListener("error", reject, {once: true});
});

const result = await new Promise((resolve, reject) => {
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id !== 1) {
      return;
    }
    if (message.error || message.result.exceptionDetails) {
      reject(new Error(message.error?.message ?? message.result.exceptionDetails.text));
      return;
    }
    resolve(message.result.result.value);
  });
  socket.send(JSON.stringify({
    id: 1,
    method: "Runtime.evaluate",
    params: {expression, returnByValue: true},
  }));
});

console.log(JSON.stringify(result, null, 2));
socket.close();

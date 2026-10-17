const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;",
};

/**
 * Escapes text when building raw HTML strings for `innerHTML` or `trustedHTML`.
 *
 * Structured `html` templates already escape ordinary values. Passing an
 * escaped value to those templates would display entities literally, so use
 * the original string there. Keep this helper at raw-markup boundaries.
 *
 * @param value - Text that may contain HTML-significant characters.
 * @returns The value with `&`, `<`, `>`, `'`, and `"` replaced by HTML entities.
 */
export const escapeHtml = (value: string): string =>
  value.replace(/[&<>'"]/g, (character) => HTML_ENTITIES[character] ?? character);

/**
 * Serializes data for an inline `<script type="application/json">` element.
 *
 * Prerendered pages use these elements to hand the client the same data the
 * server rendered with, so the first client render matches the SSG markup.
 * `<` is written as `<`, so authored text such as `</script>` cannot close
 * the element early; `JSON.parse` restores the original characters.
 *
 * @param value - JSON-serializable data to embed.
 * @returns Script-safe JSON text.
 */
export const serializeJsonForScript = (value: unknown): string =>
  JSON.stringify(value).replace(/</g, "\\u003c");

/**
 * Reads data embedded with {@link serializeJsonForScript}.
 *
 * Used during hydration, before a component's first render. Returns `null` when
 * the element is absent (client-side navigation) or its content is not valid
 * JSON, letting callers fall back to their normal loading path.
 *
 * @param root - Node to search; usually the host element or `document`.
 * @param selector - Selector for the JSON script element.
 * @returns The parsed value, or `null` when no usable data is embedded.
 */
export const readJsonScript = <T>(root: ParentNode, selector: string): T | null => {
  const source = root.querySelector<HTMLScriptElement>(selector)?.textContent;
  if (!source) {
    return null;
  }
  try {
    return JSON.parse(source) as T;
  } catch {
    return null;
  }
};

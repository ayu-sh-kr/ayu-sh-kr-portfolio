const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;",
};

/**
 * Escapes text before it is interpolated into an HTML template string.
 *
 * @param value - Text that may contain HTML-significant characters.
 * @returns The value with `&`, `<`, `>`, `'`, and `"` replaced by HTML entities.
 */
export const escapeHtml = (value: string): string =>
  value.replace(/[&<>'"]/g, (character) => HTML_ENTITIES[character] ?? character);

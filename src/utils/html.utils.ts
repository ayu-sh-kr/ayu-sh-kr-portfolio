const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;",
};

/** Escapes text before it is interpolated into an HTML template string. */
export const escapeHtml = (value: string): string =>
  value.replace(/[&<>'"]/g, (character) => HTML_ENTITIES[character] ?? character);

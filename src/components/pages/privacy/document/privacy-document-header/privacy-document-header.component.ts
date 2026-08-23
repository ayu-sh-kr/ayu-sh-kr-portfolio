import { BaseElement, Component, Property, String } from "@ayu-sh-kr/dota-wrap/core";
import { html, trustedHTML } from "@ayu-sh-kr/dota-wrap/rendering";
import type { PrivacyMetadata } from "@app/service/privacy-loader.service.ts";
import { escapeHtml } from "@app/utils/html.utils.ts";

/** Formats an authored ISO date without applying the visitor's timezone. */
const formatDate = (value: string): string => {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
};

/** Renders the loaded privacy policy's introductory metadata and summary. */
@Component({
  selector: "privacy-document-header",
  shadow: false,
})
export class PrivacyDocumentHeaderComponent extends BaseElement {
  /** Serialized privacy metadata supplied by the document view after loading. */
  @Property({ name: "metadata", type: String })
  metadata = "";

  /** Creates the static privacy-header element. */
  constructor() {
    super();
  }

  /** Parses metadata passed across the component boundary. */
  private parsedMetadata(): PrivacyMetadata | null {
    try {
      return JSON.parse(this.metadata) as PrivacyMetadata;
    } catch {
      return null;
    }
  }

  /** Renders the policy identity, dates, scope, and plain-language summary. */
  render() {
    const metadata = this.parsedMetadata();
    if (!metadata) {
      return "";
    }

    const summary = metadata.summary
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");

    return html`
      <header class="privacy-header">
        <div class="privacy-chip-row">
          <span class="privacy-chip">Privacy</span>
          <span class="privacy-chip privacy-chip-muted">Version ${escapeHtml(metadata.version)}</span>
        </div>
        <h1>${escapeHtml(metadata.title)}</h1>
        <p class="privacy-tagline">${escapeHtml(metadata.tagline)}</p>
        <div class="privacy-proof" aria-label="Policy dates and scope">
          <span>Last updated <strong>${formatDate(metadata.updated)}</strong></span>
          <span>In effect from <strong>${formatDate(metadata.effective)}</strong></span>
          <span>Applies to <strong>${escapeHtml(metadata.applies)}</strong></span>
        </div>
        <section class="privacy-summary" aria-labelledby="privacy-summary-title">
          <p id="privacy-summary-title" class="privacy-eyebrow">The short version</p>
          <ul>${trustedHTML(summary)}</ul>
          <p class="privacy-summary-note">${escapeHtml(metadata.summaryNote)}</p>
        </section>
      </header>
    `;
  }
}

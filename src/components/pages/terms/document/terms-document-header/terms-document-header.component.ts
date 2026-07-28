import { BaseElement, Component, HTML, Property, String } from "@ayu-sh-kr/dota-wrap/core";
import type { TermsMetadata } from "@app/service/terms-loader.service.ts";
import { escapeHtml } from "@app/utils/html.utils.ts";

/** Formats an authored ISO date without applying the visitor's timezone. */
const formatDate = (value: string): string => {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
};

/** Renders the loaded terms document's introductory metadata and summary. */
@Component({
  selector: "terms-document-header",
  shadow: false,
})
export class TermsDocumentHeaderComponent extends BaseElement {
  /** Serialized terms metadata supplied by the document view after loading. */
  @Property({ name: "metadata", type: String })
  metadata = "";

  /** Creates the static terms-header element. */
  constructor() {
    super();
  }

  /** Parses metadata passed across the component boundary. */
  private parsedMetadata(): TermsMetadata | null {
    try {
      return JSON.parse(this.metadata) as TermsMetadata;
    } catch {
      return null;
    }
  }

  /** Renders the terms identity, dates, jurisdiction, and plain-language summary. */
  render(): string {
    const metadata = this.parsedMetadata();
    if (!metadata) {
      return "";
    }

    return HTML`
      <header class="terms-header">
        <div class="terms-chip-row">
          <span class="terms-chip">Terms</span>
          <span class="terms-chip terms-chip-muted">Version ${escapeHtml(metadata.version)}</span>
        </div>
        <h1>${escapeHtml(metadata.title)}</h1>
        <p class="terms-tagline">${escapeHtml(metadata.tagline)}</p>
        <div class="terms-proof" aria-label="Terms dates and jurisdiction">
          <span>Last updated <strong>${formatDate(metadata.updated)}</strong></span>
          <span>In effect from <strong>${formatDate(metadata.effective)}</strong></span>
          <span>Governed by the law of <strong>${escapeHtml(metadata.governingLaw)}</strong></span>
        </div>
        <section class="terms-summary" aria-labelledby="terms-summary-title">
          <p id="terms-summary-title" class="terms-eyebrow">The short version</p>
          <ul>${metadata.summary.map((item) => HTML`<li>${escapeHtml(item)}</li>`).join("")}</ul>
          <p class="terms-summary-note">${escapeHtml(metadata.summaryNote)}</p>
        </section>
      </header>
    `;
  }
}

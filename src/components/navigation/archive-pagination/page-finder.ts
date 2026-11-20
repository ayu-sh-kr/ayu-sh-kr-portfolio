import { html } from "@ayu-sh-kr/dota-wrap/rendering";
import type { ArchiveSection, PageSummary } from "./pager-contract.ts";

/** A single page bookmark opens a native modal for both exact entry and scrubbing the whole archive. */
export function renderPageFinder(section: ArchiveSection, current: number, total: number) {
  const id = section + "-page-finder";
  return html`
    <button type="button" class="pager-bookmark" aria-haspopup="dialog" aria-controls="${id}">
      <span class="bookmark-mark" aria-hidden="true"></span>Jump to page
    </button>
    <dialog class="page-finder" id="${id}" aria-labelledby="${id}-title">
      <form>
        <div class="finder-head">
          <h2 id="${id}-title">Jump to page</h2>
          <button type="button" class="finder-close" aria-label="Close page finder">×</button>
        </div>
        <p class="finder-entry"><label for="${id}-number">Page</label>
          <input id="${id}-number" type="number" min="1" max="${total}" step="1" value="${current}" required inputmode="numeric">
          <span>of ${total}</span></p>
        <label class="finder-scale">Browse pages
          <input type="range" min="1" max="${total}" step="1" value="${current}">
        </label>
        <div class="finder-ends" aria-hidden="true"><span>Newest</span><span>Oldest</span></div>
        <div class="finder-preview" aria-live="polite" aria-atomic="true"></div>
        <button type="submit" class="finder-go">Open page</button>
      </form>
    </dialog>`;
}

/** All listeners belong to this opening. Closing or unmounting releases them together. */
export function openPageFinder(host: HTMLElement, current: number, summary: (page: number) => PageSummary,
  navigate: (page: number) => void, lifetime: AbortSignal): void {
  const dialog = host.querySelector<HTMLDialogElement>("dialog")!;
  if (dialog.open) return;
  const form = dialog.querySelector("form")!;
  const number = form.querySelector<HTMLInputElement>('[type="number"]')!;
  const range = form.querySelector<HTMLInputElement>('[type="range"]')!;
  const preview = form.querySelector<HTMLElement>(".finder-preview")!;
  const session = new AbortController();
  const options = { signal: session.signal };
  const close = () => dialog.close();
  const dispose = () => {
    session.abort();
    lifetime.removeEventListener("abort", unmount);
  };
  const unmount = () => { close(); dispose(); };
  lifetime.addEventListener("abort", unmount, { once: true });
  const describe = (page: number) => {
    const data = summary(page);
    const heading = document.createElement("strong");
    heading.textContent = data.dates;
    const entries = document.createElement("span");
    entries.textContent = `Entries ${data.first}–${data.last}`;
    preview.replaceChildren(heading, entries);
  };
  number.value = range.value = String(current);
  describe(current);
  number.addEventListener("input", () => {
    if (!number.validity.valid) { preview.replaceChildren(); return; }
    range.value = number.value;
    describe(number.valueAsNumber);
  }, options);
  range.addEventListener("input", () => {
    number.value = range.value;
    describe(range.valueAsNumber);
  }, options);
  form.querySelector(".finder-close")!.addEventListener("click", close, options);
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    close();
    if (number.valueAsNumber !== current) navigate(number.valueAsNumber);
  }, options);
  dialog.addEventListener("close", () => {
    dispose();
    host.querySelector<HTMLButtonElement>(".pager-bookmark")?.focus({ preventScroll: true });
  }, { ...options, once: true });
  dialog.showModal();
  number.focus();
  number.select();
}

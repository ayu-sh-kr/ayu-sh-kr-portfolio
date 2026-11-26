import { html } from "@ayu-sh-kr/dota-wrap/rendering";
import type { PageSummary } from "./pager-contract.ts";

/** Shared by all pagination variants, with the same destination for typing and scrubbing. */
export function renderPageFinder(current: number, total: number) {
  const id = "news-page-finder";
  return html`
    <button type="button" class="pager-bookmark" aria-haspopup="dialog" aria-controls="${id}">
      <span class="bookmark-mark" aria-hidden="true"></span>Jump to page
    </button>
    <dialog class="page-finder" id="${id}" aria-labelledby="${id}-title">
      <form>
        <header class="finder-head">
          <h2 id="${id}-title" tabindex="-1" autofocus>Jump to page</h2>
          <button type="button" class="finder-close" aria-label="Close page finder">×</button>
        </header>
        <div class="finder-selection">
          <div class="finder-entry">
            <label for="${id}-number">Page</label>
            <input class="form-control input-md input-bordered" id="${id}-number" type="number"
              min="1" max="${total}" step="1" value="${current}" required inputmode="numeric">
            <span>of ${total}</span>
          </div>
          <label class="finder-scale" style="--finder-intervals: ${Math.min(total - 1, 12)}">
            <span class="sr-only">Browse pages</span>
            <input type="range" min="1" max="${total}" step="1" value="${current}">
          </label>
          <div class="finder-ends" aria-hidden="true"><span>Newest</span><span>Oldest</span></div>
        </div>
        <div class="finder-foot">
          <div class="finder-preview" aria-live="polite" aria-atomic="true">
            <strong></strong><span></span>
          </div>
          <button type="submit" class="finder-go">Open page</button>
        </div>
      </form>
    </dialog>`;
}

/** Keep the dialog modal through the exit transition, then restore focus or open the selected archive. */
export function openPageFinder(host: HTMLElement, current: number, summary: (page: number) => PageSummary,
  navigate: (page: number) => void, lifetime: AbortSignal): void {
  const dialog = host.querySelector<HTMLDialogElement>("dialog")!;
  if (dialog.open) return;
  const form = dialog.querySelector("form")!;
  const number = form.querySelector<HTMLInputElement>('[type="number"]')!;
  const range = form.querySelector<HTMLInputElement>('[type="range"]')!;
  const dates = form.querySelector<HTMLElement>(".finder-preview strong")!;
  const entries = form.querySelector<HTMLElement>(".finder-preview span")!;
  const session = new AbortController();
  const options = { signal: session.signal };
  const dispose = () => {
    session.abort();
    lifetime.removeEventListener("abort", unmount);
    delete dialog.dataset.closing;
  };
  const unmount = () => { dispose(); dialog.close(); };
  lifetime.addEventListener("abort", unmount, { once: true });

  const dismiss = (destination = current) => {
    if (dialog.hasAttribute("data-closing")) return;
    dialog.dataset.closing = "";
    const finish = () => {
      if (session.signal.aborted) return;
      dispose();
      dialog.close();
      if (destination !== current) navigate(destination);
      else host.querySelector<HTMLButtonElement>(".pager-bookmark")?.focus({ preventScroll: true });
    };
    // Reading animations flushes the new CSS state and also respects a zero-duration motion preference.
    const transitions = dialog.getAnimations?.() ?? [];
    if (transitions.length) void Promise.allSettled(transitions.map(animation => animation.finished)).then(finish);
    else finish();
  };

  const describe = (page: number) => {
    const data = summary(page);
    dates.textContent = data.dates;
    entries.textContent = `Entries ${data.first}–${data.last}`;
  };
  number.value = range.value = String(current);
  describe(current);
  number.addEventListener("input", () => {
    if (!number.validity.valid) {
      dates.textContent = `Choose a page from 1 to ${number.max}`;
      entries.textContent = "";
      return;
    }
    range.value = number.value;
    describe(number.valueAsNumber);
  }, options);
  // Let the thumb track a finger continuously. Keyboard navigation still steps one whole page.
  const snapToPage = () => {
    const page = Math.round(range.valueAsNumber);
    range.step = "1";
    range.value = String(page);
  };
  range.addEventListener("pointerdown", () => { range.step = "any"; }, options);
  range.addEventListener("change", snapToPage, options);
  range.addEventListener("pointerup", snapToPage, options);
  range.addEventListener("pointercancel", snapToPage, options);
  range.addEventListener("blur", snapToPage, options);
  range.addEventListener("input", () => {
    const page = Math.round(range.valueAsNumber);
    if (number.valueAsNumber === page) return;
    number.value = String(page);
    describe(page);
  }, options);
  form.querySelector(".finder-close")!.addEventListener("click", () => dismiss(), options);
  dialog.addEventListener("cancel", event => { event.preventDefault(); dismiss(); }, options);
  // Both ends of a tap must land outside the form. Scrubbing off the panel should keep it open.
  let backdropPress = false;
  dialog.addEventListener("pointerdown", event => { backdropPress = event.target === dialog; }, options);
  dialog.addEventListener("click", event => {
    if (backdropPress && event.target === dialog) dismiss();
    backdropPress = false;
  }, options);
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (form.reportValidity()) dismiss(number.valueAsNumber);
  }, options);
  dialog.showModal();
  form.querySelector("h2")!.focus({ preventScroll: true });
}

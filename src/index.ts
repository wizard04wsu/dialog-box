/**
 * DialogBox — structure-locked, themeable dialog that loads CSS from a separate file.
 * External CSS with dev cache-busting: appends ?v=timestamp to CSS URL in dev mode.
 */

declare const __DEV__: boolean; // injected at build time

const bust = __DEV__ ? `?v=${Date.now()}` : '';
const cssURL = new URL(`./dialog-box.css${bust}`, import.meta.url);

const styleAssetPromise: Promise<CSSStyleSheet | string> = (async () => {
  const res = await fetch(cssURL, { cache: __DEV__ ? 'no-store' : 'default' });
  if (!res.ok) throw new Error(`Failed to load ${cssURL}`);
  const cssText = await res.text();

  const supportsConstructable =
    'adoptedStyleSheets' in Document.prototype &&
    'replace' in CSSStyleSheet.prototype;

  if (supportsConstructable) {
    const sheet = new CSSStyleSheet();
    await sheet.replace(cssText);
    return sheet;
  }
  return cssText;
})();

export class DialogBox extends HTMLElement {
  #root: ShadowRoot;
  #dialog!: HTMLDialogElement;

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: 'open' });
    this.#root.innerHTML = `
      <style>
        /* Minimal skeleton: hide dialog until styles attach */
        :host(:not([data-ready])) { display: contents; }
        :host(:not([data-ready])) dialog { visibility: hidden; }
      </style>
      <dialog part="dialog" role="dialog" aria-modal="true">
        <slot>
          <button type="button" formmethod="dialog">Close</button>
        </slot>
      </dialog>
    `;
  }

  connectedCallback() {
    this.#dialog = this.#root.querySelector('dialog')!;

    styleAssetPromise.then(asset => {
      if (asset instanceof CSSStyleSheet) {
        const current = (this.#root as any).adoptedStyleSheets as CSSStyleSheet[] | undefined;
        const sheets = current ? [...current, asset] : [asset];
        (this.#root as any).adoptedStyleSheets = sheets;
      } else {
        const styleEl = document.createElement('style');
        styleEl.textContent = asset;
        this.#root.insertBefore(styleEl, this.#root.firstChild);
      }
      this.setAttribute('data-ready', '');
      if (this.hasAttribute('open')) this.open();
    }).catch(err => {
      console.error('[dialog-box] stylesheet failed:', err);
      this.setAttribute('data-ready', '');
      if (this.hasAttribute('open')) this.open();
    });
  }

  open() {
    const d: any = this.#dialog;
    if (typeof d?.showModal === 'function') {
      if (!this.#dialog.open) d.showModal();
    } else {
      this.#dialog.setAttribute('open', '');
    }
  }

  close(returnValue?: string) {
    const d: any = this.#dialog;
    if (typeof d?.close === 'function') d.close(returnValue);
    else this.#dialog.removeAttribute('open');
  }
}

export default DialogBox;

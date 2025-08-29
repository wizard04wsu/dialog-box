/**
 * DialogBox — structure-locked, themeable dialog that loads CSS from a separate file.
 * External CSS with dev cache-busting: appends ?v=timestamp to CSS URL in dev mode.
 */

declare const __DEV__: boolean; // injected at build time

import cssText from './dialog-box.css';
import htmlText from './dialog-box.html';

export class DialogBox extends HTMLElement {
	
	#root: ShadowRoot;
	#dialog!: HTMLDialogElement;
	
	constructor() {
		
		super();
		
		this.#root = this.attachShadow({ mode: 'open' });
		
		// Adopt the skeleton CSS.
		const sheet = new CSSStyleSheet();
		sheet.replaceSync(cssText);
		this.#root.adoptedStyleSheets.push(sheet);
		
		// Add the skeleton HTML.
		this.#root.innerHTML = htmlText;
	}
	
	connectedCallback() {
		// The component has been inserted into the DOM.
		// Note that this is called *each time* the component is connected.
		
		this.#dialog = this.#root.querySelector('dialog')!;
		
		// If the component has the `open` attribute, open the dialog non-modal.
		if (this.hasAttribute('open')) this.show();
	}
	
	get open(): boolean { return this.#dialog.open; }
	
	private openDialog(modal: boolean = true, closedBy?: string): void {
		
		if (this.#dialog?.isConnected && !this.#dialog.open) {
			// The dialog is in the DOM and is closed.
			
			if (closedBy && ['any', 'closerequest', 'none'].includes(closedBy)) {
				this.#dialog.closedBy = closedBy;
			}
			else {
				this.#dialog.closedBy = modal ? 'closerequest' :  'none';
			}

			this.#dialog.ariaModal = ''+modal;

			// Open the dialog.
			modal ? this.#dialog.showModal() : this.#dialog.show();
		}
	}
	
	show(): void { this.openDialog(false); }
	showModal(): void { this.openDialog(true); }
	
	private closeDialog(returnValue?: string, cancelable: boolean = false): void {
		
		if (this.#dialog?.isConnected && this.#dialog.open) {
			// The dialog is in the DOM and is open.
			
			// Close (or request to close) the dialog.
			cancelable ? this.#dialog.requestClose(returnValue) : this.#dialog.close(returnValue);
		}
	}
	
	close(returnValue?: string) { this.closeDialog(returnValue, false); }
	requestClose(returnValue?: string) { this.closeDialog(returnValue, true); }
}

export default DialogBox;

/**
 * DialogBox — structure-locked, themeable dialog that loads CSS from a separate file.
 * External CSS with dev cache-busting: appends ?v=timestamp to CSS URL in dev mode.
 */

declare const __DEV__: boolean; // True unless in production. (Injected at build time.)

import cssText from './dialog-box.css';
import htmlText from './dialog-box.html';

// Event types to watch for on the backdrop that should be forwarded to the host element.
const outsideEventTypes = ['click', 'mousedown', 'mouseup'];

export class DialogBox extends HTMLElement {
	
	#root: ShadowRoot;
	#dialog!: HTMLDialogElement;
	
	#inDOM?: boolean = false;
	#isOpen?: boolean = false;
	#openedAsModal?: boolean = false;
	
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
		// A lifecycle callback called each time the element is inserted into the DOM.
		
		this.#inDOM = true;
		
		if (this.#dialog) return;	// Already initialized.
		
		this.#dialog = this.#root.querySelector('dialog')!;
		
		const dialogEvents = ['close', 'cancel'];
		
		// Forward `close` and `cancel` events to the host.
		for (const type of dialogEvents) {
			this.#dialog.addEventListener(type, (event) => {
				if (event.target !== this.#dialog) return;
				this.dispatchEvent(event);
			});
		}
	}
	
	disconnectedCallback() {
		// A lifecycle callback called each time the element is removed from the DOM.
		
		this.#inDOM = false;
	}
	
	connectedMoveCallback() {
		// A lifecycle callback called each time the element is moved to a different place in the DOM.
		// This is called *instead* of `disconnectedCallback()` and `connectedCallback()`.
		
		// Do nothing.
	}
	
	
	/**
	 * A string representing the return value of the dialog box when it's closed.
	 *
	 * @type {(string | void)}
	 * @memberof DialogBox
	 */
	get returnValue(): string | void { return this.#dialog.returnValue; }
	set returnValue(value: string | any) { this.#dialog.returnValue = ''+value; }
	
	
	/**
	 * Whether the dialog box is currently open.
	 *
	 * @readonly
	 * @type {boolean}
	 * @memberof DialogBox
	 */
	get isOpen(): boolean { return this.#isOpen!; }
	
	
	/**
	 * Whether the dialog box is currently open and is modal.
	 *
	 * @readonly
	 * @type {boolean}
	 * @memberof DialogBox
	 */
	get isOpenModal(): boolean { return this.isOpen && this.#openedAsModal!; }
	
	
	/**
	 * Open the dialog box, non-modal.
	 */
	show(): void {
		if (!this.#inDOM || this.#isOpen) return;
		
		this.#dialog.ariaModal = 'false';
		
		this.#isOpen = true;
		this.#openedAsModal = false;
		this.#dialog.show();
	}
	
	
	/**
	 * Open the dialog box, modal.
	 * 
	 * @param {Function} [outsideEventCallback] - Callback to handle an event on the backdrop, outside of the dialog box.
	 */
	showModal(outsideEventCallback?: Function): void {
		if (!this.#inDOM || this.#isOpen) return;
		
		this.#dialog.ariaModal = 'true';
		
		if (outsideEventCallback instanceof Function) {
			
			// Call the handler for relevant events on the backdrop.
			for (const type of outsideEventTypes) {
				this.#dialog.addEventListener(type, (event) => {
					
					if (event.target !== this.#dialog) return;
					if (!(event instanceof MouseEvent)) return;
					
					const rect = this.#dialog.getBoundingClientRect();
					const insideDialog =
						event.clientX >= rect.left &&
						event.clientX <= rect.right &&
						event.clientY >= rect.top &&
						event.clientY <= rect.bottom;
					
					if (!insideDialog) {
						outsideEventCallback(event);
					}
				});
			}
		}
		
		this.#isOpen = true;
		this.#openedAsModal = true;
		this.#dialog.showModal();
	}
	
	
	/**
	 * Close the dialog box.
	 * The `close` event is not cancelable.
	 * 
	 * @param {string} [returnValue] - An updated value for the dialog box's `returnValue` property.
	 */
	close(returnValue?: string | any): void {
		if (!this.#isOpen) return;
		
		this.#isOpen = false;
		this.#dialog.close(returnValue);
	}
	
	
	/**
	 * Request closure of the dialog box.
	 * A `cancel` event (cancelable) is fired before the `close` event.
	 * 
	 * @param {string} [returnValue] - An updated value for the dialog box's `returnValue` property.
	 */
	requestClose(returnValue?: string | any): void {
		if (!this.#isOpen) return;
		
		this.#dialog.addEventListener('close', (event) => { this.#isOpen = false; });
		this.#dialog.requestClose(returnValue);
	}
}

export default DialogBox;

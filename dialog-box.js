(function (){
	
	"use strict";
	
	const CSS = ``;
	const HTML = 
		`<style>${CSS}</style>
		<dialog><div id="wrapper">
			<div id="closebutton"><button type="button"><span aria-hidden="true">&#x2715;</span><span>Close</span></button><div></div></div>
			<div id="content"><slot name="content"></slot></div>
		</div></dialog>`;
	
	// Create a template for the dialog box.
	// This is used to create the shadow DOM for each instance of the component.
	const TEMPLATE = document.createElement('template');
	TEMPLATE.innerHTML = HTML;
	
	/**
	 * HTML component to display a dialog box. Essentially, `<dialog>` with a few enhancements.
	 *
	 * @class DialogBox
	 */
	class DialogBox extends HTMLElement {
		
		#dialog;
		#closeButton;
		
		content;
		
		/**
		 * 
		 * @param {*} options 
		 * @param {boolean} [options.closeOnBackdropClick=true] - If true, the dialog will close when the user clicks outside of it (on the backdrop).
		 * @param {boolean} [options.showCloseButton=true] - If true, the dialog will show a close button ('X') that the user can click to close the dialog.
		 */
		constructor(options = {}){
			
			super();
			
			// Create the shadow DOM and clone the template.
			const shadowRoot = this.attachShadow({mode: 'open'});
			shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
			
			// Save references to the internal elements.
			this.#dialog = shadowRoot.querySelector(':scope > dialog');
			this.#closeButton = shadowRoot.querySelector('#closebutton');
			this.content = shadowRoot.querySelector('slot[name="content"]');
			
			if(options.closeOnBackdropClick || options.closeOnBackdropClick === void 0){
				// The dialog should close when the user clicks outside of it (on the backdrop).
				
				// Add an event listener.
				this.#dialog.addEventListener('mousedown', (event)=>{
					if(event.target === this.#dialog){
						this.#dialog.close();
					}
				});
			}
			
			if(options.showCloseButton || options.showCloseButton === void 0){
				// The 'X' close button should be shown.
				
				// Make the close button visible.
				this.#closeButton.style.display = 'block';
				
				// Set the close button to automatically be focused when the dialog is shown.
				this.#closeButton.autofocus = true;
				
				// Add an event listener.
				this.#closeButton.addEventListener('click', ()=>this.#dialog.close());
			}
		}
		
		show(){
			// Show the dialog.
			if(!this.#dialog.open){
				this.#dialog.show();
			}
		}
		
		showModal(){
			// Show the dialog.
			if(!this.#dialog.open){
				this.#dialog.showModal();
			}
		}
		
		close(){
			// Close the dialog.
			if(this.#dialog.open){
				this.#dialog.close();
			}
		}
		
		requestClose(){
			// Close the dialog.
			if(this.#dialog.open){
				this.#dialog.requestClose();
			}
		}
	}
})();

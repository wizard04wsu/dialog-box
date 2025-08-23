(function (){
	
	"use strict";
	
	const ELEMENT_NAME = 'dialog-box';
	const CSS = ``;
	/*const HTML = 
		`<style>${CSS}</style>
		<dialog id="dialog"><div id="wrapper">
			<div id="closebutton"><button type="button"><span aria-hidden="true">&#x2715;</span><span>Close</span></button><div></div></div>
			<div id="content"><slot></slot></div>
		</div></dialog>`;*/
	const HTML = 
		`<dialog id="dialog"><div id="wrapper">
			<div id="content"><slot>
				<form><button id="button" formmethod="dialog">Close</button></form>
			</slot></div>
		</div></dialog>`;
	
	// Create a template for the dialog box.
	// This is used to create the shadow DOM for each instance of the component.
	const TEMPLATE = document.createElement('template');
	TEMPLATE.innerHTML = HTML;
	
	// Construct a stylesheet to be used by all instances of the component.
	const STYLESHEET = new CSSStyleSheet();
	STYLESHEET.replaceSync(CSS);
	
	/**
	 * HTML component to display a dialog box. Essentially, `<dialog>` with a few enhancements.
	 *
	 * @class DialogBox
	 */
	class DialogBox extends HTMLElement {
		
		#dialog;
		/*#closeButton;*/
		#openIsModal;
		
		content;
		
		/**
		 * 
		 * @param {*} options 
		 * @param {boolean} [options.closeOnBackdropClick=true] - If true, the dialog will close when the user clicks outside of it (on the backdrop).
		 * @param {boolean} [options.showCloseButton=true] - If true, the dialog will show a close button ('X') that the user can click to close the dialog.
		 */
		constructor(options = {}){
			
			super();
			
			// Create the shadow DOM.
			const shadowRoot = this.attachShadow({mode: 'open'});
			shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
			
			// Adopt the stylesheet for the shadow DOM.
			shadowRoot.adoptedStyleSheets = [STYLESHEET];
			
			// Save references to the internal elements.
			this.#dialog = shadowRoot.querySelector('#dialog');
			/*this.#closeButton = shadowRoot.querySelector('#closebutton');*/
			this.content = shadowRoot.querySelector('#content > slot');
			
			/*// Bind dialog methods to the instance.
			this.show = this.#dialog.show.bind(this.#dialog);
			this.showModal = this.#dialog.showModal.bind(this.#dialog);
			this.close = this.#dialog.close.bind(this.#dialog);
			this.requestClose = this.#dialog.requestClose.bind(this.#dialog);*/
			
			// Set dialog properties to match the custom attributes.
			this.closedBy = this.getAttribute('closedby');
			
			/*if(options.closeOnBackdropClick || options.closeOnBackdropClick === void 0){
				// The dialog should close when the user clicks outside of it (on the backdrop).
				
				// Add an event listener.
				this.#dialog.addEventListener('mousedown', (event)=>{
					if(event.target === this.#dialog){
						this.#dialog.close();
					}
				});
			}*/
			
			/*if(options.showCloseButton || options.showCloseButton === void 0){
				// The 'X' close button should be shown.
				
				// Make the close button visible.
				this.#closeButton.style.display = 'block';
				
				if(!this.content.querySelector('[autofocus]')){
					// There is no element within the content that has the `autofocus` attribute.
					
					// Set the close button to gain focus when the dialog is shown.
					this.#closeButton.autofocus = true;
				}
				
				// Add an event listener.
				this.#closeButton.addEventListener('click', ()=>this.#dialog.close());
			}*/
			
			this.#openIsModal = this.getAttribute('modal') !== null;
			
			this.#dialog.addEventListener('close', (event)=>{
				console.log('close event', event);
				this.removeAttribute('open');
			});
			
			if(this.getAttribute('open') !== null){
				this.#openDialog();
			}
			console.log(`DialogBox constructor() - open: ${this.open}, modal: ${this.modal}, closedBy: ${this.closedBy}`);
		}
		
		// Observe changes to these custom attributes.
		static observedAttributes = ['open', 'modal', 'closedby'];
		
		// Built-in method to handle changes to the observed custom attributes.
		attributeChangedCallback(name, oldValue, newValue){
			console.log(`attributeChangedCallback(${name}, ${oldValue}, ${newValue})`);
			
			if(oldValue !== newValue){
				
				if(name === 'closedby'){
					this.closedBy = newValue;
				}
				else{
					this[name] = newValue;
				}
			}
		}
		
		get returnValue(){
			return this.#dialog.returnValue;
		}
		set returnValue(value){
			this.#dialog.returnValue = value;
		}
		
		get open(){
			return this.#dialog.open;
		}
		set open(value){
			console.log('open setter', value);
			if(value !== null){
				this.#openDialog();
			}
			else{
				this.close(this.returnValue);
			}
		}
		
		get modal(){
			return this.open ? this.#openIsModal : this.getAttribute('modal') !== null;
		}
		set modal(value){
			console.log('modal setter', value);
			if(value !== null){
				this.setAttribute('modal', '');
			}
			else{
				this.removeAttribute('modal');
			}
		}
		
		get closedBy(){
			return this.#dialog.closedBy;
		}
		set closedBy(value){
			console.log('closedBy setter', value);
			if(['any', 'closerequest', 'none'].includes(value)){
				this.#dialog.closedBy = value;
				this.setAttribute('closedby', value);
			}
			else{
				this.#dialog.closedBy = void 0;
				this.removeAttribute('closedby');
			}
		}
		
		#openDialog(){
			console.log('#openDialog()');
			if(this.modal){
				this.showModal();
			}
			else{
				this.show();
			}
		}
		
		show(){
			console.log('show()', this.closedBy);
			this.#dialog.show();
			this.setAttribute('open', '');
			this.removeAttribute('modal');
		}
		
		showModal(){
			console.log('showModal()', this.closedBy);
			this.#dialog.showModal();
			this.setAttribute('open', '');
			this.setAttribute('modal', '');
		}
		
		close(returnValue = ''){
			console.log('close()');
			this.#dialog.close(returnValue);
		}
		
		requestClose(returnValue = ''){
			console.log('requestClose()');
			this.#dialog.requestClose(returnValue);
		}
	}
	
	window.customElements.define(ELEMENT_NAME, DialogBox);
})();

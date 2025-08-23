(function (){
	
	"use strict";
	
	if(!document.querySelector(".ncmec-modaldialog")){
		// This component does not exist on the page.
		return;
	}
	
	
	//TODO: Turn these into configurations somewhere instead of hardcoded values.
	
	const EXCLUDED_PAGES_SHORT = /^\/(es\/)?(theissues\/missingfromcare|gethelpnow)(\/.*)?$/i;
	const EXCLUDED_PAGES_LONG = /^\/content\/ncmec\/(en|es)\/(poster|new-poster|theissues\/missingfromcare|gethelpnow).*$/i;
	const EXCLUDED_PAGES_VANITY = /^\/(es\/)?(search|searchnearme|posters?|amber|missingfromcare|quickreport|cmfc)(\/.*)?$/i;
	
	const PERSISTENCE_DELAY = 1000*60*60*24;
	
	// With this parameter in the query string, dialogs that are meant to be shown
	// when the page loads will have any stored timestamp removed so that they open
	// regardless of a persistence delay.
	const EXPIRATION_OVERRIDE_PARAM = "showmodal";
	
	// With this parameter in the query string, dialogs that are meant to be shown
	// when the page loads will not be shown by that event.
	// This supersedes EXPIRATION_OVERRIDE_PARAM.
	const PAGE_LOAD_OVERRIDE_PARAM = "hidemodal";
	
	
	
	const path = document.location.pathname;
	if(inIframe() || EXCLUDED_PAGES_SHORT.test(path) || EXCLUDED_PAGES_LONG.test(path) || EXCLUDED_PAGES_VANITY.test(path)){
		// Modal dialogs are not to be used on this page.
		return;
	}
	
	function inIframe() {
		try{
			return window.self !== window.top;
		}catch(e){
			return true;
		}
	}
	
	document.addEventListener("DOMContentLoaded", ()=>{
		
		const queryParams = new URLSearchParams(document.location.search);
		const overrideOpenOnLoad = queryParams.get(PAGE_LOAD_OVERRIDE_PARAM) !== null;
		const overrideExpiration = queryParams.get(EXPIRATION_OVERRIDE_PARAM) !== null;
		
		const dialogs = document.querySelectorAll("dialog.ncmec-modaldialog");
		dialogs.forEach((dialog)=>{
			// For each modal dialog component:
			
			const persistenceDelay = PERSISTENCE_DELAY;
			const timestampKey = dialog.id && `ncmec-modaldialog_${dialog.id}_closed`;
			
			// Add an event listener for the dialog's close event.
			dialog.addEventListener("close", function (event){
				
				if(dialog.dataset.openOnLoad && persistenceDelay && timestampKey){
					// The dialog is meant to be displayed when the page loads.
					// A delay is specified so that, once the user closes the dialog,
					// it will not be displayed again until the specified time has elapsed.
					
					// Save a timestamp in local storage.
					window.localStorage.setItem(timestampKey, Date.now());
				}
			});
			
			// Add an event listener on the close button.
			const closeButton = dialog.querySelector(".ncmec-modaldialog__closebutton button");
			closeButton.addEventListener("click", ()=>dialog.close());
			
			if(dialog.dataset.closeOnBackdropClick){
				// The dialog should close when the user clicks outside of it (on the backdrop).
				
				// Add an event listener on the backdrop.
				dialog.addEventListener("mousedown", function (event){
					if(event.target === dialog){
						dialog.close();
					}
				});
			}
			
			if(dialog.dataset.openOnLoad && persistenceDelay && timestampKey && !overrideOpenOnLoad){
				// The dialog is meant to be displayed when the page loads.
				// A delay is specified so that, once the user closes the dialog,
				// it will not be displayed again until the specified time has elapsed.
				
				if(overrideExpiration){
					// The parameter to override the delay was present in the query string.
					
					// Remove the timestamp.
					window.localStorage.removeItem(timestampKey);
				}
				
				const timestamp = window.localStorage.getItem(timestampKey);
				if(timestamp){
					// A timestamp was saved when the user previously closed the dialog.
					
					if(timestamp + persistenceDelay <= Date.now()){
						// The delay has elapsed.
						
						// Show the dialog.
						dialog.showModal();
						
						// Remove the timestamp.
						window.localStorage.removeItem(timestampKey);
					}
				}
				else{
					// No timestamp was saved.
					
					// Show the dialog.
					dialog.showModal();
				}
			}
		});
	});
})();

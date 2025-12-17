import DialogBox from './index.js';

try {
    DialogBox.registerTagName();
}
catch (error: any) {
    
    error = error as Error;
    
    if (error.name === 'ConflictError') {
        // There was a conflict registering the tag name.
        
        // Continue, assuming the name was registered by a previous initialization of this script.
        console.debug(error.message);
    }
    else {
        throw error;
    }
}

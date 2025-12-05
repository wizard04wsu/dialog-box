import DialogBox from './index.js';

try {
    DialogBox.registerTagName();
}
catch (error: any) {
    
    const err = error as Error;
    console.log(error);
    
    if (err.name === 'ConflictError') {
        // There was a conflict registering the tag name.
        
        // Continue, assuming the name was registered by a previous initialization of this script.
        console.debug(err.message);
    }
    else {
        throw error;
    }
}

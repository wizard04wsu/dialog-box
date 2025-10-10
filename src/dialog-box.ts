import DialogBox from './index.js';

const tag = 'dialog-box';
if (!customElements.get(tag)) {
  customElements.define(tag, DialogBox);
}

export { DialogBox as default, DialogBox };

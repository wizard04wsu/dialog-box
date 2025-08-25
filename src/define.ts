import XDialog from './index.js';

const tag = 'x-dialog';
if (!customElements.get(tag)) {
  customElements.define(tag, XDialog);
}

export { XDialog };
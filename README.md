
# @example/x-dialog (Option 2: external CSS + dev cache-busting)

A minimal, structure-locked, themeable `<x-dialog>` web component.

- Loads CSS from a separate file (`dialog.css`).
- In dev (`NODE_ENV=development`), tsup injects `__DEV__=true` → CSS URL gets `?v=timestamp` and `cache:'no-store'` to always fetch fresh styles.
- In production, clean URLs and normal caching.

## Scripts

```bash
npm run dev   # serves files with http-server -c-1, NODE_ENV=development
npm run build # builds with tsup, NODE_ENV=production
```

## Usage

```js
import { XDialog } from '@example/x-dialog';
customElements.define('x-dialog', XDialog);
```

Or auto-define:

```js
import '@example/x-dialog/define';
```

On CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/@example/x-dialog/dist/define.global.js"></script>
<x-dialog></x-dialog>
```

## Dev preview

```bash
npm i
npm run build
npm run dev
# open http://localhost:5174/dev.html
```

## Notes

- Build copies `src/dialog.css` into `dist/dialog.css` via postbuild (shx cp).
- Cache-busting only happens in dev mode.


# @example/dialog-box (external CSS + dev cache-busting)

A minimal, structure-locked, themeable `<dialog-box>` web component.

- Loads CSS from a separate file (`dialog-box.css`).
- In dev (`NODE_ENV=development`), tsup injects `__DEV__=true` → CSS URL gets `?v=timestamp` and `cache:'no-store'` to always fetch fresh styles.
- In production, clean URLs and normal caching.

## Scripts

```bash
npm run dev   # serves files with http-server -c-1, NODE_ENV=development
npm run build # builds with tsup, NODE_ENV=production
```

## Usage

```js
import { DialogBox } from '@example/dialog-box';
customElements.define('dialog-box', DialogBox);
```

Or auto-define:

```js
import '@example/dialog-box/define';
```
## Dev preview

```bash
npm i
npm run build
npm run dev
# open http://localhost:5174/dev.html
```

## Notes

- Build copies `src/dialog-box.css` into `dist/dialog-box.css` via postbuild (shx cp).
- Cache-busting only happens in dev mode.

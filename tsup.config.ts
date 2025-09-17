import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,  // Empty the "dist/" folder before compiling.
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
  dts: true,
  entry: {
    index: 'src/index.ts',  // The DialogBox module.
    define: 'src/define.ts',  // The DialogBox module, defined as the <dialog-box> custom element.
  },
  format: ['esm'],
  loader: {
    '.css': 'text',  // Import CSS files as strings.
    '.html': 'text',  // Import HTML files as strings.
  },
  minify: (process.env.NODE_ENV === 'production'),  // Only minify for production.
  sourcemap: false,
  splitting: false,
  target: 'es2022',
});

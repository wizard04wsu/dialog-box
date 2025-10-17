import { defineConfig } from 'tsup';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { transform as cssMinifier } from 'esbuild';
import { minify as htmlMinifier } from 'html-minifier-terser';

const cssMinifyImportPlugin = {
  // Plugin to minify imported CSS for only '*.css?minify'.
  name: 'css-minify-import',
  setup(build) {
    
    // Intercept CSS imports that explicitly opt in via the '?minify' suffix.
    build.onResolve({ filter: /\.css\?minify$/ }, (args) => {
      
      // Resolve the full path, keeping the '?minify' suffix, and add a namespace.
      return {
        path: resolve(dirname(args.importer), args.path),
        namespace: 'css-minify-import',
      };
    });

    // Import opted-in CSS files as minified strings.
    build.onLoad({ filter: /.*/, namespace: 'css-minify-import' }, async (args) => {
      
      // Get the contents of the CSS file.
      const css = readFileSync(args.path.replace(/\?minify$/, ''), 'utf8');
      
      // Minify the CSS.
      const minified = (await cssMinifier(css, { loader: 'css', minify: true })).code;
      
      // Set the default export to be the minified string.
      return {
        contents: `export default ${JSON.stringify(minified)};`,
        loader: 'js',
      };
    });
  },
};

const htmlMinifyImportPlugin = {
  // Plugin to minify imported HTML for only '*.html?minify'.
  name: 'html-minify-import',
  setup(build) {
    
    // Intercept HTML imports that explicitly opt in via the '?minify' suffix.
    build.onResolve({ filter: /\.html?\?minify$/ }, (args) => {
      
      // Resolve the full path, keeping the '?minify' suffix, and add a namespace.
      return {
        path: resolve(dirname(args.importer), args.path),
        namespace: 'html-minify-import',
      };
    });

    // Import opted-in HTML files as minified strings.
    build.onLoad({ filter: /.*/, namespace: 'html-minify-import' }, async (args) => {
      
      // Get the contents of the HTML file.
      const html = readFileSync(args.path.replace(/\?minify$/, ''), 'utf8');
      
      // Minify the HTML.
      const minified = (await htmlMinifier(html, {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        collapseBooleanAttributes: true,
        // If you have inline CSS/JS in templates and want them minified too:
        minifyCSS: true,
        minifyJS: true,
        // Conservative toggles you can enable as needed:
        //removeOptionalTags: true,
        //removeEmptyAttributes: true,
        //keepClosingSlash: true,
      }));
      
      // Set the default export to be the minified string.
      return {
        contents: `export default ${JSON.stringify(minified)};`,
        loader: 'js',
      };
    });
  },
};

export default defineConfig([
  {
    name: 'esm',
    outDir: "dist/esm",
    clean: true,  // Empty the "dist/" folder before compiling.
    dts: true,
    entry: {
      index: 'src/index.ts',  // The DialogBox module. The tag name must still be defined.
      'dialog-box': 'src/dialog-box.ts',  // The DialogBox module, defined as the <dialog-box> custom element.
    },
    format: ['esm'],
    injectStyle: false,
    minify: true,
    sourcemap: false,
    splitting: false,
    target: 'es2022',
    
    esbuildOptions(options) {
      options.loader = {
        ...options.loader,
        '.html': 'text',  // .html => text (string)
        '.css': 'css',  // .css  => css (let tsup/esbuild extract to dist/*.css)
      };
    },
      
    esbuildPlugins: [
      cssMinifyImportPlugin,
      htmlMinifyImportPlugin,
    ],
  },
  {
    name: 'dev_esm',
    clean: true,
    outDir: "dist/dev_esm",
    dts: true,
    entry: {
      index: 'src/index.ts',  // The DialogBox module. The tag name must still be defined.
      'dialog-box': 'src/dialog-box.ts',  // The DialogBox module, defined as the <dialog-box> custom element.
    },
    format: ['esm'],
    injectStyle: false,
    minify: false,
    sourcemap: true,
    splitting: false,
    target: 'es2022',
    
    esbuildOptions(options) {
      options.loader = {
        ...options.loader,
        '.html': 'text',  // .html => text (string)
        '.css': 'css',  // .css  => css (let tsup/esbuild extract to dist/*.css)
      };
    },
      
    esbuildPlugins: [
      cssMinifyImportPlugin,
      htmlMinifyImportPlugin,
    ],
  },
]);

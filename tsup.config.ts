import { defineConfig } from 'tsup';
import { readFileSync, realpathSync } from 'fs';
import { resolve, dirname } from 'path';
import { transform as cssMinifier } from 'esbuild';
import { minify as htmlMinifier } from 'html-minifier-terser';

const packageRoot = realpathSync('.');

const cssMinifyImportPlugin = {
  // Plugin to minify imported CSS for only '*.css?minify'.
  name: 'css-minify-import',
  setup(build: any) {
    
    // Intercept CSS imports that explicitly opt in via the '?minify' suffix.
    build.onResolve({ filter: /\.css\?minify$/ }, (args: any) => {
      
      // Resolve the full path, keeping the '?minify' suffix, and add a namespace.
      // (Note that `args.importer` contains the real path; symlinks are ignored.)
      const resolvedPath = resolve(dirname(args.importer), args.path);
      return {
        path: resolvedPath.replace(packageRoot, '').replace(/\\/g, '/'), // Package-relative path (for injected comments)
        pluginData: {
          resolvedPath: resolvedPath, // Full path
        },
        namespace: 'css-minify-import',
      };
    });

    // Import opted-in CSS files as minified strings.
    build.onLoad({ filter: /.*/, namespace: 'css-minify-import' }, async (args: any) => {
      
      // Get the contents of the CSS file.
      const cssPath = args.pluginData.resolvedPath.replace(/\?minify$/, '');
      const css = readFileSync(cssPath, 'utf8');
      
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
  setup(build: any) {
    
    // Intercept HTML imports that explicitly opt in via the '?minify' suffix.
    build.onResolve({ filter: /\.html?\?minify$/ }, (args: any) => {
      
      // Resolve the full path, keeping the '?minify' suffix, and add a namespace.
      // (Note that `args.importer` contains the real path; symlinks are ignored.)
      const resolvedPath = resolve(dirname(args.importer), args.path);
      return {
        path: resolvedPath.replace(packageRoot, '').replace(/\\/g, '/'), // Package-relative path (for injected comments)
        pluginData: {
          resolvedPath: resolvedPath, // Full path
        },
        namespace: 'html-minify-import',
      };
    });

    // Import opted-in HTML files as minified strings.
    build.onLoad({ filter: /.*/, namespace: 'html-minify-import' }, async (args: any) => {
      
      // Get the contents of the HTML file.
      const htmlPath = args.pluginData.resolvedPath.replace(/\?minify$/, '');
      const html = readFileSync(htmlPath, 'utf8');
      
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
    format: ['esm'],
    outDir: "dist/esm",
    clean: true,  // Empty the `outDir` folder before compiling.
    entry: {
      'dialog-box-class.mjs': 'src/index.ts',  // Rename output to "dist/esm/dialog-box.mjs.js".
      'dialog-box.mjs': 'src/dialog-box.ts',  // Rename output to "dist/esm/register-dialog-box.mjs.js".
    },
    dts: false,  // Do not generate type declaration files (*.d.ts).
    sourcemap: false,  // Do not generate source map files (*.js.map).
    injectStyle: false,
    minify: true,
    splitting: false,
    target: 'es2022',
    
    esbuildOptions(options) {
      options.loader = {
        ...options.loader,
        '.html': 'text',  // .html => text (string)
        '.css': 'css',  // .css  => css (let tsup/esbuild extract to dist/*.css)
      };
      options.preserveSymlinks = true;
    },
      
    esbuildPlugins: [
      cssMinifyImportPlugin,
      htmlMinifyImportPlugin,
    ],
  },
  {
    name: 'esm',
    format: ['esm'],
    outDir: "dist/esm",
    entry: {
      'dialog-box-class': 'src/index.ts',
      'dialog-box': 'src/dialog-box.ts',
    },
    dts: false,  // Do not generate type declaration files (*.d.ts).
    sourcemap: false,  // Do not generate source map files (*.js.map).
    injectStyle: false,
    minify: false,
    splitting: false,
    target: 'es2022',
    
    esbuildOptions(options) {
      options.loader = {
        ...options.loader,
        '.html': 'text',  // .html => text (string)
        '.css': 'css',  // .css  => css (let tsup/esbuild extract to dist/*.css)
      };
      options.preserveSymlinks = true;
    },
      
    esbuildPlugins: [
      cssMinifyImportPlugin,
      htmlMinifyImportPlugin,
    ],
  },
  {
    name: 'dev_esm',
    format: ['esm'],
    outDir: "dist/dev_esm",
    clean: true,  // Empty the `outDir` folder before building.
    entry: {
      'dialog-box-class': 'src/index.ts',
      'dialog-box': 'src/dialog-box.ts',
    },
    dts: true,  // Generate type declaration files (*.d.ts).
    sourcemap: true,  // Generate source map files (*.js.map).
    injectStyle: false,
    minify: false,
    splitting: false,
    target: 'es2022',
    
    esbuildOptions(options) {
      options.loader = {
        ...options.loader,
        '.html': 'text',  // .html => text (string)
        '.css': 'css',  // .css  => css (let tsup/esbuild extract to dist/*.css)
      };
      options.preserveSymlinks = true;
    },
      
    esbuildPlugins: [
      cssMinifyImportPlugin,
      htmlMinifyImportPlugin,
    ],
  },
]);

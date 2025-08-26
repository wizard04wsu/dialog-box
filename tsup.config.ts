import { defineConfig } from 'tsup';

export default defineConfig({
  clean: false,
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
  dts: true,
  entry: {
    index: 'src/index.ts',
    define: 'src/define.ts',
  },
  format: ['esm'],
  minify: true,
  sourcemap: false,
  splitting: false,
  target: 'es2022'
});

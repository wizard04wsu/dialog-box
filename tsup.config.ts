import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    define: 'src/define.ts',
  },
  format: ['esm', 'iife'],
  globalName: 'XDialog',
  dts: true,
  target: 'es2022',
  sourcemap: true,
  clean: true,
  minify: true,
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
})
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.js',
      name: 'MyP5Lib',
      fileName: (format) => `dkwdp-interactivelib.${format}.js`,
      formats: ['umd', 'es']
    },
    rollupOptions: {
      external: ['p5'],
      output: {
        globals: { p5: 'p5' }
      }
    }
  }
});

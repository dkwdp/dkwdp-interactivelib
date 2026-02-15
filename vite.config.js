import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.js',
      name: 'dkwdp-interactive', // The global name when using <script> tags
      fileName: 'dkwdp-interactive'
    },
    rollupOptions: {
      external: ['p5'], // Don't bundle p5 into your library file
      output: {
        globals: { p5: 'p5' }
      }
    }
  }
});

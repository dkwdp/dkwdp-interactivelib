import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'DkwdpInteractive',
      fileName: 'dkwdp-interactivelib',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['p5', 'p5.sound'],
      output: {
        globals: { 
          p5: 'p5',
          'p5.sound': 'p5.sound'
        }
      }
    }
  },
  plugins: [dts({ insertTypesEntry: true })]
});

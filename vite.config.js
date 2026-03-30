import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'DkwdpInteractive',
      fileName: 'dkwdpil',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['p5'],
      output: {
        globals: { 
          p5: 'p5'
        }
      }
    }
  },
  plugins: [dts({ insertTypesEntry: true })]
});

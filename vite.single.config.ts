import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Gera um único arquivo HTML (dist-single/index.html) que funciona offline
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  build: { outDir: 'dist-single' },
});

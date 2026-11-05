import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    // Modo sem internet: guarda o sistema no aparelho e permite instalar como aplicativo
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      includeAssets: ['favicon.png'],
      manifest: {
        name: 'VetClin Internação',
        short_name: 'VetClin',
        description: 'Sistema de internação da VetClin Clínica Veterinária',
        lang: 'pt-BR',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#f4f7f9',
        theme_color: '#075d9c',
        icons: [
          { src: 'icone-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icone-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icone-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,webmanifest}'],
        navigateFallback: 'index.html',
        // dados e login sempre vão direto ao Supabase (a cópia offline dos dados fica no IndexedDB)
        navigateFallbackDenylist: [/^\/auth/, /^\/rest/],
      },
    }),
  ],
});

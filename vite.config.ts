import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/Jeux-Enfant/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-icon.svg', 'pwa-192.png', 'pwa-512.png'],
      manifest: {
        name: 'Jeux Enfant — Portail de Mini-Jeux',
        short_name: 'Jeux Enfant',
        description: 'Des mini-jeux colorés, ludiques et sans pub pour tablette !',
        theme_color: '#FF9F43',
        background_color: '#FFF8EE',
        display: 'standalone',
        orientation: 'any',
        start_url: '/Jeux-Enfant/',
        scope: '/Jeux-Enfant/',
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'pwa-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
});

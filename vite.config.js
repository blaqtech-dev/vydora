
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      devOptions: {
        enabled: true,
      },

      registerType: 'autoUpdate',

      includeAssets: ['favicon.svg'],

      manifest: {
        id: '/',
        name: 'Vydora - Video to Audio Converter',
        short_name: 'Vydora',
        description:
          'Convert videos into audio quickly and easily with Vydora.',
        theme_color: '#080b1a',
        background_color: '#080b1a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',

        icons: [
          {
            src: '/vydora-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/vydora-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },

      workbox: {
        navigateFallbackDenylist: [/^\/api\//],
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,woff2}',
        ],
      },
    }),
  ],
});

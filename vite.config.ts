import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
   plugins: [
      react(),
      VitePWA({
         registerType: 'autoUpdate', // Auto-updates the service worker
         includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'], // Optional assets to include
         manifest: {
            name: 'hydrated',
            short_name: 'hydrated',
            description: 'A simple app to log your water intake.',
            theme_color: '#ffffff',
            background_color: '#ffffff',
            display: 'standalone', // Makes the app open in a "headless" mode
            start_url: '/', // The URL when the app is opened
            icons: [
               {
                  src: 'glass-water.svg',
                  sizes: '192x192',
                  type: 'image/svg',
               },
               {
                  src: 'glass-water.svg',
                  sizes: '512x512',
                  type: 'image/svg',
               },
            ],
         },
      }),
   ],
   resolve: {
      alias: {
         '@': path.resolve(__dirname, './src'),
      },
   },
});

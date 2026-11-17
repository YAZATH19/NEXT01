
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: ['next01-logo.png'],

      manifest: {
        name: 'NEXT01 - Digital Lifestyle Platform',
        short_name: 'NEXT01',
        description:
          'NEXT01 Digital Lifestyle and Merchant Ecosystem Platform',

        theme_color: '#050A30',
        background_color: '#050A30',

        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
  {
    src: '/pwa-192x192.png',
    sizes: '192x192',
    type: 'image/png',
    purpose: 'any',
  },
  {
    src: '/pwa-512x512.png',
    sizes: '512x512',
    type: 'image/png',
    purpose: 'any',
  },
],

      },
    }),
  ],
})

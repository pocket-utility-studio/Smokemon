import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json'

export default defineConfig({
  base: '/Smokemon/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Smokémon',
        short_name: 'Smokémon',
        description: 'A Pokémon-themed medical cannabis journal',
        theme_color: '#84cc16',
        background_color: '#0e1a0b',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/Smokemon/',
        scope: '/Smokemon/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'icon-192-dark.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512-dark.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Smokédex',
            short_name: 'Dex',
            description: 'Open strain journal',
            url: '/Smokemon/smokedex',
            icons: [{ src: 'icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'PokeCenter',
            short_name: 'Center',
            description: 'Symptom recommender',
            url: '/Smokemon/poke-center',
            icons: [{ src: 'icon-192.png', sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,gif,mp3,ttf}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],
})

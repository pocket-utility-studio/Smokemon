import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { writeFileSync } from 'fs'
import pkg from './package.json'

// Writes dist/version.json after every build.
// The SW globPatterns exclude .json so this file is never precached —
// it is always fetched live from the network, making version checks reliable.
const versionJsonPlugin = {
  name: 'version-json',
  closeBundle() {
    writeFileSync('dist/version.json', JSON.stringify({ version: pkg.version }))
  },
}

export default defineConfig({
  base: '/Smokemon/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    rollupOptions: {
      external: ['onnxruntime-web', 'onnxruntime-web/webgpu'],
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    versionJsonPlugin,
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,gif,mp3,ttf}'],
        globIgnores: ['**/homepic.png', '**/Homepic.png'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
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
    }),
  ],
})

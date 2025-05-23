import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths({
      projects: [resolve(__dirname, '../../tsconfig.json')],
    }),
    vanillaExtractPlugin(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../src'),
    },
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    cssCodeSplit: true,
    cssMinify: true,
    terserOptions: {
      compress: {
        passes: 2,
        ecma: 2015,
        unsafe_math: false,
        conditionals: true,
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug', 'console.info'],
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
        ecma: 2015,
        webkit: true,
      },
      safari10: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router'],
          apollo: ['@apollo/client', 'graphql'],
          ui: ['react-aria-components', '@phosphor-icons/react'],
          vanilla: ['@vanilla-extract/recipes', '@vanilla-extract/dynamic'],
        },
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 700,
    copyPublicDir: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@apollo/client', 'graphql'],
    // Optionally exclude problematic dependencies
    exclude: ['apollo-upload-client'],
  },
})

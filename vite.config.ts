import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), vanillaExtractPlugin()],
  build: {
    target: 'es2015', 
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    terserOptions: {
      compress: {
        passes: 2,
        ecma: 2015,
        unsafe_math: false,
        conditionals: true,
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false,
        ecma: 2015,
        webkit: true
      },
      safari10: true  
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react': ['react', 'react-dom'],
          'router': ['react-router'],
          'apollo': ['@apollo/client', 'graphql'],
          'ui': ['react-aria-components', '@phosphor-icons/react'],
          'vanilla': ['@vanilla-extract/recipes', '@vanilla-extract/dynamic']
        },
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 700,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@apollo/client', 'graphql'],
    // Optionally exclude problematic dependencies
    exclude: ['apollo-upload-client']
  },
})

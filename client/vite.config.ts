import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

import tailwind from 'tailwindcss';
import autoprefixer from 'autoprefixer';

import viteTsconfigPaths from 'vite-tsconfig-paths';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  // @ts-ignore
  plugins: [
    vue(),
    // viteTsconfigPaths(),
    nodePolyfills({
      globals: {
        Buffer: true,
        process: true
      }
    })
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  },
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
      // buff: 'rollup-plugin-node-polyfills/polyfills/buffer-es6'
    }
  }
  // optimizeDeps: {
  //   esbuildOptions: {
  //     define: {
  //       global: 'globalThis'
  //     }
  //   }
  // },
  // build: {
  //   outDir: 'build',
  //   rollupOptions: { external: [/@aws-sdk/] }
  // }
});

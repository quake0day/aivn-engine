import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@aivn/core': path.resolve(__dirname, '../../packages/core/src'),
      '@aivn/renderer': path.resolve(__dirname, '../../packages/renderer/src'),
      '@aivn/character-system': path.resolve(__dirname, '../../packages/character-system/src'),
      '@aivn/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@aivn/script-parser': path.resolve(__dirname, '../../packages/script-parser/src'),
      '@aivn/ai-director': path.resolve(__dirname, '../../packages/ai-director/src'),
      '@aivn/image-gen': path.resolve(__dirname, '../../packages/image-gen/src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});

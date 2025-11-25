import { execSync } from 'node:child_process';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

const basePath = process.env.BASE_PATH || '/';

const commitHash = execSync('git rev-parse --short HEAD').toString();

export default defineConfig({
  define: {
    APP_COMMIT_HASH: JSON.stringify(commitHash),
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
  },
  plugins: [
    react(),
    visualizer({
      filename: 'build_stats/stats_treemap.html',
      open: false,
      gzipSize: true,
      template: 'treemap',
    }),
  ],
  base: basePath,
  server: {
    port: 3000,
    strictPort: true, // Port 3000 is required by CORS
  },
  preview: {
    port: 3000,
  },
  build: {
    outDir: 'build',
  },
});

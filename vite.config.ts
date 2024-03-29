import { execSync } from 'child_process';

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
  plugins: [react()],
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
    rollupOptions: {
      plugins: [
        visualizer({
          filename: 'build_stats/stats_treemap.html',
          template: 'treemap',
        }),
      ],
    },
  },
});

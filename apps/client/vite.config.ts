import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const target = process.env.VITE_API_URL || 'http://localhost:8080';
const proxy = Object.fromEntries(
  ['/api', '/s/', '/shared', '/example', '/healthz', '/readyz'].map(path => [path, { target, changeOrigin: false }])
);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    proxy,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
  },
});

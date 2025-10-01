import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],
  // No 'define' or 'loadEnv' is needed. Vite handles VITE_ variables by default.
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});

import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// This simple config is secure and will fix both build errors.
export default defineConfig({
  base: "/",
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});

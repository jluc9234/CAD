import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// This is the correct, secure configuration.
export default defineConfig({
  base: "/",
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});

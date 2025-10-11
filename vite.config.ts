import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to Netlify Functions running locally via `netlify dev`
      '/api': 'http://localhost:8888/.netlify/functions',
    },
  },
});

import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: "/",
    plugins: [react()],
    define: {
      // Expose the API key to the client-side code for the Gemini service
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      // Expose the API key for Mapbox service
      'process.env.MAPBOX_ACCESS_TOKEN': JSON.stringify(env.MAPBOX_ACCESS_TOKEN),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});

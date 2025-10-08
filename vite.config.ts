import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Security: Validate VITE_PAYPAL_CLIENT_ID is not a secret
const validatePayPalClientId = (id: string | undefined): string | undefined => {
  if (!id) return undefined;
  
  // PayPal client IDs typically start with 'A' and are around 80 characters
  // PayPal secrets typically start with 'E' and have different patterns
  const startsWithA = id.startsWith('A');
  const isReasonableLength = id.length >= 70 && id.length <= 90;
  const isAlphanumericWithUnderscoresAndHyphens = /^[A-Za-z0-9_-]+$/.test(id);
  
  const isValidClientId = startsWithA && isReasonableLength && isAlphanumericWithUnderscoresAndHyphens;
  
  if (!isValidClientId) {
    console.error('WARNING: VITE_PAYPAL_CLIENT_ID appears to be invalid or a secret and will be filtered out for security');
    return undefined;
  }
  
  return id;
};

// This simple config is secure and will fix both build errors.
export default defineConfig({
  base: "/",
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  define: {
    // Override the problematic environment variable with validation
    'import.meta.env.VITE_PAYPAL_CLIENT_ID': JSON.stringify(
      validatePayPalClientId(process.env.VITE_PAYPAL_CLIENT_ID)
    ),
  }
});

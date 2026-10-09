import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Use './' so the built app works from any sub-folder (e.g. Laravel /public/eclipse).
  base: './',
});

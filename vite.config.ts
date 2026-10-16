import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { ttsPlugin } from './src/server/ttsPlugin.ts';
import { authPlugin } from './src/server/authPlugin.ts';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), ttsPlugin(), authPlugin()],
  server: {
    host: true,
    port: 5173,
  },
});

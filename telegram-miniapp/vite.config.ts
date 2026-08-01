import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // so ngrok / LAN devices can reach the dev server
    port: 5173,
  },
});

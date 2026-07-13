import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api/resume-draft": {
        target: "http://127.0.0.1:5001/al06team5/us-central1/resumeDraft",
        changeOrigin: true,
        rewrite: () => ""
      }
    },
    watch: {
      usePolling: true
    }
  }
});

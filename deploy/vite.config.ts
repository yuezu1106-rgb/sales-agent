import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 开发环境代理：/api → 后端 8080
export default defineConfig({
  base: "/app/",
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});

/**
 * Vite 构建配置
 *
 * 开发服务器代理 /api → localhost:7600（后端 FastAPI）
 */
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 7610,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:7600",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 7610,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});

/**
 * Vite 构建配置
 *
 * 开发服务器代理 /api → localhost:9600（后端 FastAPI）
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
    port: 9610,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:9600",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 9610,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});

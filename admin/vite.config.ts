/**
 * Vite 构建配置
 *
 * 开发服务器代理 /api → localhost:7600（后端 FastAPI）
 */
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";

export default defineConfig(({ command, mode }) => {
  const production = command === "build" && mode === "production";
  const configFile = resolve(__dirname, "deploy/production.conf");
  const apiBaseUrl = production
    ? parseEnv(readFileSync(configFile, "utf8")).ADMIN_API_BASE_URL
    : undefined;
  if (production && !apiBaseUrl?.trim()) {
    throw new Error(`Admin 构建：${configFile} 缺少 ADMIN_API_BASE_URL，请填写后重新构建`);
  }
  return {
    envDir: production ? false : undefined,
    envPrefix: production ? [] : undefined,
    define: production ? { "import.meta.env.VITE_API_BASE_URL": JSON.stringify(apiBaseUrl) } : undefined,
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
  };
});

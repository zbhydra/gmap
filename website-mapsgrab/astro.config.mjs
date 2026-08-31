import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'astro/config'
import vue from '@astrojs/vue'
import languageSitemap from './src/sitemap/languageSitemap.mjs'

// 域名后配：MapsGrab 生产域名确定后替换此占位常量（同步 public/robots.txt、deploy/、cloudflare/）。
const SITE_PLACEHOLDER = 'https://mapsgrab.com'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const basePath = '/'
// https://astro.build/config
export default defineConfig({
  site: process.env.NODE_ENV === 'production' ? SITE_PLACEHOLDER : 'http://localhost:7630',
  base: basePath,
  trailingSlash: 'ignore',
  server: {
    port: 7630
  },
  devToolbar: {
    enabled: false
  },
  integrations: [
    vue(),
    languageSitemap()
  ],
  build: {
    format: 'directory',
    // SSG 页面由 CDN 压缩传输；内联当前路由 CSS 可消除移动网络上的额外关键往返。
    inlineStylesheets: 'always'
  },
  vite: {
    server: {
      strictPort: true,
      proxy: {
        // 设备可信校验图标由后端返回并写 device_trust，dev 下反代到本地后端（购买/登录链路基座）。
        '^/assets/icons/(?:logo|credits)\\.svg(?:\\?.*)?$': {
          target: 'http://localhost:7600',
          changeOrigin: true
        }
      },
      fs: {
        allow: [__dirname]
      }
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }
  }
})

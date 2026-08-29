import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'astro/config'
import vue from '@astrojs/vue'
import languageSitemap from './src/sitemap/languageSitemap.mjs'

// Use /tg-web base path for production, / for development
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDev = process.env.NODE_ENV !== 'production'
// const basePath = isDev ? '/' : '/tg-web';
// NOTE: Using literal '/' instead of variable to avoid BASE_URL becoming '//'
const basePath = '/'
// https://astro.build/config
export default defineConfig({
  site: isDev ? 'http://localhost:9620' : 'https://telegramdownloadmedia.com',
  base: basePath,
  trailingSlash: 'ignore',
  server: {
    port: 9620
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
    optimizeDeps: {
      include: ['mediabunny']
    },
    resolve: {
      alias: {
        mediabunny: path.resolve(__dirname, 'node_modules/mediabunny')
      }
    },
    server: {
      strictPort: true,
      proxy: {
        '^/assets/icons/(?:logo|credits)\\.svg(?:\\?.*)?$': {
          target: 'http://localhost:9600',
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

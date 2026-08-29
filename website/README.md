# Telegram Media Downloader Official Website

Official website for Telegram Media Downloader browser extension.

## Tech Stack

- **Astro** - Modern static site generator
- **Vue 3** - For interactive components
- **TypeScript** - Type-safe development

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
website/
├── public/              # Static assets
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── i18n/            # Internationalization
│   │   ├── ui.ts        # Locale configurations
│   │   └── content.ts   # Content translations
│   ├── layouts/         # Layout components
│   │   └── Layout.astro # Main layout with SEO
│   ├── pages/           # Page routes
│   │   ├── index.astro      # English home page
│   │   ├── [lang]/          # Localized pages
│   │   ├── solutions.astro  # No Limits page
│   │   └── *-downloader.astro # Platform downloader pages
│   └── styles/         # Global styles
├── astro.config.mjs    # Astro configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies
```

## Supported Languages

- 简体中文 (zh-CN) - Default
- English (en-US)
- 日本語 (ja-JP)
- 한국어 (ko-KR)
- 繁體中文 (zh-TW)

## SEO Features

- Pre-rendered static HTML
- Sitemap generation
- Robots.txt configuration
- Open Graph meta tags
- Twitter Card support
- Structured data (JSON-LD)
- hreflang tags for multilingual SEO
- Cloudflare Bulk Redirects 301 for retired `/features/`, `/guide/`, and `/faq/` pages

## Deployment

The site generates static files in `dist/` directory that can be deployed to:

- Netlify
- Vercel
- GitHub Pages
- Cloudflare Pages
- Any static hosting service

## Configuration

Production builds read public runtime values from `website/.env.production`:

- `PUBLIC_API_BASE_URL` - backend API base URL.
- `PUBLIC_SHARED_COOKIE_DOMAIN` - shared `client_uuid` Cookie domain. Production
  and test deploys set this to `telegramdownloadmedia.com` from `deploy/deploy.sh`
  so the root site and test subdomain keep sharing the same device cookie scope.
- `PUBLIC_GOOGLE_CLIENT_ID` - Google Identity Services OAuth client ID for website login.

Google OAuth login returns to the backend OAuth callback under
`PUBLIC_API_BASE_URL`. Add the backend OAuth callback URI to Google Console:

- `https://tg-download-api.telegramdownloadmedia.com/api/client/auth/google/oauth/callback`
- `http://localhost:9600/api/client/auth/google/oauth/callback`

Update `astro.config.mjs` to change:

- `site` - Your domain URL
- `base` - Base path if deploying to subdirectory

## License

MIT

import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('website auth origin helpers', () => {
  it('accepts only official website origins and builds the fixed v2 login URL', async () => {
    vi.stubGlobal('__DEV__', false)
    vi.stubGlobal('__API_BASE_URL__', 'https://tg-download-api.telegramdownloadmedia.com')
    vi.stubGlobal('__WEBSITE_BASE_URL__', 'https://telegramdownloadmedia.com')

    const { buildExtensionLoginUrl, isAllowedWebsiteAuthOrigin } = await import(
      '../../src/core/api/auth/websiteOrigin'
    )

    expect(buildExtensionLoginUrl()).toBe(
      'https://telegramdownloadmedia.com/extension-login-v2'
    )
    expect(isAllowedWebsiteAuthOrigin('https://telegramdownloadmedia.com')).toBe(true)
    expect(isAllowedWebsiteAuthOrigin('https://www.telegramdownloadmedia.com')).toBe(true)
    expect(isAllowedWebsiteAuthOrigin('http://localhost:9620')).toBe(false)
    expect(isAllowedWebsiteAuthOrigin('https://attacker.example.com')).toBe(false)
  })

  it('builds local v2 login URL for development package', async () => {
    vi.stubGlobal('__DEV__', true)
    vi.stubGlobal('__API_BASE_URL__', 'http://localhost:9600')
    vi.stubGlobal('__WEBSITE_BASE_URL__', 'http://localhost:9620')

    const { buildExtensionLoginUrl, isAllowedWebsiteAuthOrigin } = await import(
      '../../src/core/api/auth/websiteOrigin'
    )

    expect(buildExtensionLoginUrl()).toBe('http://localhost:9620/extension-login-v2')
    expect(isAllowedWebsiteAuthOrigin('http://localhost:9620')).toBe(true)
    expect(isAllowedWebsiteAuthOrigin('https://telegramdownloadmedia.com')).toBe(false)
  })
})

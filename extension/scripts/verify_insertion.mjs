import { chromium } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  createExtensionChromiumLaunchOptions,
  installE2eBrowserIdentity
} from '../../scripts/playwright-browser-identity.mjs'
import {
  closeOtherPages,
  distPath,
  extensionRoot,
  resolveTelegramProfileDir
} from './setup-test-profile-runtime.mjs'

const telegramUrl = 'https://web.telegram.org/a/#-1001077688074'
const screenshotDir = path.join(extensionRoot, 'tests/logs/screenshots')

async function verify() {
  const profileDir = resolveTelegramProfileDir()
  const launchOptions = createExtensionChromiumLaunchOptions([
    `--disable-extensions-except=${distPath}`,
    `--load-extension=${distPath}`
  ])
  const context = await chromium.launchPersistentContext(profileDir, launchOptions)

  try {
    await installE2eBrowserIdentity(context)
    const restoredPages = await closeOtherPages(context)
    if (restoredPages.closeFailureCount > 0) {
      throw new Error(
        `[VERIFY_INSERTION_PAGE_CLEANUP_RETRY] phase=before-owner url=${telegramUrl} profile=${profileDir} closeFailures=${restoredPages.closeFailureCount}`
      )
    }
    const page = await context.newPage()

    page.on('console', message => {
      const value = message.text()
      if (value.includes('[Button') || value.includes('[ResourceScanner')) {
        console.info(`PAGE LOG: ${value}`)
      }
    })

    console.info('Navigating to Telegram Web...')
    await page.goto(telegramUrl, { timeout: 60_000 })

    const pageCleanup = await closeOtherPages(context, page)
    if (pageCleanup.closeFailureCount > 0) {
      throw new Error(
        `[VERIFY_INSERTION_PAGE_CLEANUP_RETRY] phase=after-navigation url=${page.url()} profile=${profileDir} closeFailures=${pageCleanup.closeFailureCount}`
      )
    }

    await page.waitForTimeout(10_000)
    fs.mkdirSync(screenshotDir, { recursive: true })
    await page.screenshot({
      path: path.join(screenshotDir, 'verification.png'),
      fullPage: false
    })

    const injected = (await page.content()).includes('data-tg-dl-injected')
    console.info(`Injection detected in HTML: ${injected}`)
    const buttons = await page.locator('.tg-dl-button').count()
    console.info(`Buttons found: ${buttons}`)
  } finally {
    await context.close()
  }
}

const isDirectRun =
  typeof process.argv[1] === 'string' &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirectRun) {
  verify().catch(error => {
    console.error(error)
    process.exitCode = 1
  })
}

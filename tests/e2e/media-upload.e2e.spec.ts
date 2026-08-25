import path from 'path'
import { fileURLToPath } from 'url'
import { test, expect, Page } from '@playwright/test'
import { getPayload } from 'payload'
import config from '../../src/payload.config.js'
import { login } from '../helpers/login'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const largeImagePath = path.resolve(dirname, 'fixtures/large-image.jpg')

// Uses its own test user (distinct from tests/helpers/seedUser.ts's testUser) so this
// spec can run in the same parallel worker pool as admin.e2e.spec.ts without both
// files racing to seed/delete the same "dev@payloadcms.com" account.
const mediaTestUser = {
  email: 'e2e-media-upload@payloadcms.com',
  password: 'test',
  name: 'Media Upload E2E Test User',
  role: 'admin' as const,
}

async function seedMediaTestUser(): Promise<void> {
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'users', where: { email: { equals: mediaTestUser.email } } })
  await payload.create({ collection: 'users', data: mediaTestUser })
}

async function cleanupMediaTestUser(): Promise<void> {
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'users', where: { email: { equals: mediaTestUser.email } } })
}

test.describe('Media upload', () => {
  let page: Page
  let createdMediaId: string | undefined

  test.beforeAll(async ({ browser }) => {
    await seedMediaTestUser()

    const context = await browser.newContext()
    page = await context.newPage()

    await login({ page, user: mediaTestUser })
  })

  test.afterAll(async () => {
    if (createdMediaId) {
      const payload = await getPayload({ config })
      await payload.delete({ collection: 'media', id: createdMediaId })
    }
    await cleanupMediaTestUser()
  })

  test('uploads a ~15MB image and it saves and renders', async () => {
    await page.goto('http://localhost:3000/admin/collections/media/create')

    await page.locator('input.file-field__hidden-input').setInputFiles(largeImagePath)
    await page.fill('#field-alt', 'Testna velika slika')

    await page.click('#action-save', { timeout: 60_000 })
    await page.waitForURL(/\/admin\/collections\/media\/[a-zA-Z0-9-_]+$/, { timeout: 60_000 })

    await expect(page.getByText('too large to submit', { exact: false })).toHaveCount(0)

    const thumbnail = page.locator('.file-details__thumbnail img').first()
    await expect(thumbnail).toBeVisible({ timeout: 30_000 })

    createdMediaId = page.url().split('/').pop()
    expect(createdMediaId).toBeTruthy()

    const payload = await getPayload({ config })
    const doc = await payload.findByID({ collection: 'media', id: createdMediaId! })

    expect(doc.filesize).toBeGreaterThan(10 * 1024 * 1024)

    const fileURL = doc.url!.startsWith('http') ? doc.url! : `http://localhost:3000${doc.url}`
    const fileResponse = await page.request.get(fileURL)
    expect(fileResponse.ok()).toBeTruthy()
  })
})

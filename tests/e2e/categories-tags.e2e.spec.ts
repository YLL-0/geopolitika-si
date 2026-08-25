import { test, expect, Page } from '@playwright/test'
import { getPayload } from 'payload'
import config from '../../src/payload.config.js'
import { login } from '../helpers/login'

// Own test user (distinct from tests/helpers/seedUser.ts's testUser) so this spec can
// run alongside admin.e2e.spec.ts without both racing to seed/delete the same account.
const catTagTestUser = {
  email: 'e2e-categories-tags@payloadcms.com',
  password: 'test',
  name: 'Categories/Tags E2E Test User',
  role: 'admin' as const,
}

async function seedCatTagTestUser(): Promise<void> {
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'users', where: { email: { equals: catTagTestUser.email } } })
  await payload.create({ collection: 'users', data: catTagTestUser })
}

async function cleanupCatTagTestUser(): Promise<void> {
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'users', where: { email: { equals: catTagTestUser.email } } })
}

const suffix = Date.now()
const categoryName = `E2E Kategorija ${suffix}`
const tagName = `E2E Oznaka ${suffix}`
const articleTitle = `E2E Članek ${suffix}`

test.describe('Categories and Tags', () => {
  let page: Page
  let categoryId: string | undefined
  let tagId: string | undefined
  let articleId: string | undefined

  test.beforeAll(async ({ browser }) => {
    await seedCatTagTestUser()

    const context = await browser.newContext()
    page = await context.newPage()

    await login({ page, user: catTagTestUser })
  })

  test.afterAll(async () => {
    const payload = await getPayload({ config })
    if (articleId) await payload.delete({ collection: 'articles', id: articleId })
    if (categoryId) await payload.delete({ collection: 'categories', id: categoryId })
    if (tagId) await payload.delete({ collection: 'tags', id: tagId })
    await cleanupCatTagTestUser()
  })

  test('admin sees Categories and Tags in the nav', async () => {
    await page.goto('http://localhost:3000/admin')

    const categoriesLink = page.getByRole('link', { name: 'Kategorije', exact: true })
    const tagsLink = page.getByRole('link', { name: 'Oznake', exact: true })

    await expect(categoriesLink).toBeVisible()
    await expect(tagsLink).toBeVisible()
  })

  test('admin can create a category', async () => {
    await page.goto('http://localhost:3000/admin/collections/categories/create')

    await page.fill('#field-name', categoryName)
    await page.click('#action-save')
    await page.waitForURL(/\/admin\/collections\/categories\/(?!create$)[a-zA-Z0-9-_]+$/, {
      timeout: 30_000,
    })

    categoryId = page.url().split('/').pop()
    expect(categoryId).toBeTruthy()

    const payload = await getPayload({ config })
    const doc = await payload.findByID({ collection: 'categories', id: categoryId! })
    expect(doc.name).toBe(categoryName)
  })

  test('admin can create a tag', async () => {
    await page.goto('http://localhost:3000/admin/collections/tags/create')

    await page.fill('#field-name', tagName)
    await page.click('#action-save')
    await page.waitForURL(/\/admin\/collections\/tags\/(?!create$)[a-zA-Z0-9-_]+$/, {
      timeout: 30_000,
    })

    tagId = page.url().split('/').pop()
    expect(tagId).toBeTruthy()

    const payload = await getPayload({ config })
    const doc = await payload.findByID({ collection: 'tags', id: tagId! })
    expect(doc.name).toBe(tagName)
  })

  test('admin can create an article and attach the category and tag', async () => {
    test.skip(!categoryId || !tagId, 'category/tag were not created')

    await page.goto('http://localhost:3000/admin/collections/articles/create')

    await page.fill('#field-title', articleTitle)

    const body = page.locator('.rich-text-lexical [contenteditable="true"]').first()
    await body.click()
    await body.fill('Testna vsebina članka.')

    await page.locator('#field-category .rs__control').click()
    await page.locator('#field-category input[type="text"]').fill(categoryName)
    await page.locator('#field-category .rs__option', { hasText: categoryName }).first().click()

    await page.locator('#field-tags .rs__control').click()
    await page.locator('#field-tags input[type="text"]').fill(tagName)
    await page.locator('#field-tags .rs__option', { hasText: tagName }).first().click()

    // Articles has drafts autosave enabled, which can create the doc and swap the URL
    // to /articles/<id> in the background while we're still filling in the form — so
    // waiting on the URL alone can resolve before our explicit Save's own request lands.
    // Tie completion to that specific request/response instead.
    const [saveResponse] = await Promise.all([
      page.waitForResponse(
        (resp) =>
          /\/api\/articles(\/[a-zA-Z0-9-_]+)?$/.test(new URL(resp.url()).pathname) &&
          ['PATCH', 'POST'].includes(resp.request().method()),
        { timeout: 30_000 },
      ),
      page.click('#action-save'),
    ])
    expect(saveResponse.ok()).toBeTruthy()

    const saveBody = await saveResponse.json()
    articleId = String(saveBody.doc?.id ?? saveBody.id)
    expect(articleId).toBeTruthy()

    const payload = await getPayload({ config })
    const doc = await payload.findByID({ collection: 'articles', id: articleId!, depth: 0 })

    expect(String(doc.category)).toBe(String(categoryId))
    expect((doc.tags ?? []).map(String)).toContain(String(tagId))
  })
})

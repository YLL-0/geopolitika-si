import type { Payload, Where } from 'payload'

import { getPayload } from 'payload'

import config from '../payload.config'
import type { Article, Category, Page, SiteSetting, Tag, User } from '../payload-types'

export const getPayloadClient = (): Promise<Payload> => getPayload({ config })

export async function getSiteSettings(): Promise<SiteSetting> {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site-settings', depth: 1 })
}

export async function getCategories(): Promise<Category[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'categories',
    limit: 50,
    sort: 'name',
  })
  return docs
}

const publishedWhere: Where = { _status: { equals: 'published' } }

type ArticlesPage = {
  docs: Article[]
  page: number
  totalPages: number
  totalDocs: number
}

export async function findArticles({
  where,
  page = 1,
  limit = 12,
  draft = false,
}: {
  where?: Where
  page?: number
  limit?: number
  draft?: boolean
} = {}): Promise<ArticlesPage> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'articles',
    where: draft ? where : where ? { and: [publishedWhere, where] } : publishedWhere,
    sort: '-publishedAt',
    depth: 2,
    page,
    limit,
    draft,
  })
  return {
    docs: result.docs,
    page: result.page ?? 1,
    totalPages: result.totalPages,
    totalDocs: result.totalDocs,
  }
}

export async function findArticleBySlug(slug: string, draft = false): Promise<Article | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'articles',
    where: draft ? { slug: { equals: slug } } : { and: [publishedWhere, { slug: { equals: slug } }] },
    depth: 2,
    limit: 1,
    draft,
  })
  return docs[0] ?? null
}

export async function findRelatedArticles(article: Article, limit = 3): Promise<Article[]> {
  const categoryId = typeof article.category === 'number' ? article.category : article.category.id
  const { docs } = await findArticles({
    where: {
      and: [{ category: { equals: categoryId } }, { id: { not_equals: article.id } }],
    },
    limit,
  })
  return docs
}

export async function findCategoryBySlug(slug: string): Promise<Category | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return docs[0] ?? null
}

export async function findTagBySlug(slug: string): Promise<Tag | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'tags',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return docs[0] ?? null
}

export async function findAuthorById(id: number): Promise<User | null> {
  const payload = await getPayloadClient()
  try {
    return await payload.findByID({ collection: 'users', id, depth: 1 })
  } catch {
    return null
  }
}

export async function findPageBySlug(slug: string, draft = false): Promise<Page | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    where: draft ? { slug: { equals: slug } } : { and: [publishedWhere, { slug: { equals: slug } }] },
    limit: 1,
    draft,
  })
  return docs[0] ?? null
}

export async function getPublishedPages(): Promise<Page[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    where: publishedWhere,
    limit: 20,
  })
  return docs
}

/** Full-text search over the search index (title, excerpt, body text). */
export async function searchArticles(query: string, page = 1, limit = 12) {
  const payload = await getPayloadClient()
  const like = query.trim()
  const result = await payload.find({
    collection: 'search',
    where: {
      or: [
        { title: { like } },
        { excerpt: { like } },
        { bodyText: { like } },
      ],
    },
    depth: 2,
    page,
    limit,
  })
  return result
}

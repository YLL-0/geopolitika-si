import type { MetadataRoute } from 'next'

import { findArticles, getCategories, getPublishedPages } from '@/lib/queries'

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [{ docs: articles }, categories, pages] = await Promise.all([
      findArticles({ limit: 1000 }),
      getCategories(),
      getPublishedPages(),
    ])

    return [
      { url: serverURL, changeFrequency: 'hourly', priority: 1 },
      ...articles.map((a) => ({
        url: `${serverURL}/article/${a.slug}`,
        lastModified: a.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
      ...categories.map((c) => ({
        url: `${serverURL}/category/${c.slug}`,
        changeFrequency: 'daily' as const,
        priority: 0.6,
      })),
      ...pages.map((p) => ({
        url: `${serverURL}/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.4,
      })),
    ]
  } catch {
    return [{ url: serverURL }]
  }
}

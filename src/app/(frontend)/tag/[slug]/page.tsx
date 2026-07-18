import type { Metadata } from 'next'

import { notFound } from 'next/navigation'
import React from 'react'

import { ArticleCard } from '@/components/ArticleCard'
import { Pagination } from '@/components/Pagination'
import { findArticles, findTagBySlug } from '@/lib/queries'

export const revalidate = 120

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tag = await findTagBySlug(slug)
  if (!tag) return {}
  return { title: `#${tag.name}`, description: `Članki z oznako ${tag.name}.` }
}

export default async function TagPage({ params, searchParams }: Props) {
  const [{ slug }, { page: pageParam }] = await Promise.all([params, searchParams])
  const tag = await findTagBySlug(slug)
  if (!tag) notFound()

  const page = Math.max(1, Number(pageParam) || 1)
  const { docs, totalPages } = await findArticles({
    where: { tags: { contains: tag.id } },
    page,
    limit: 12,
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8 border-b-2 border-accent-700 pb-4">
        <h1 className="text-3xl font-black tracking-wide">#{tag.name}</h1>
      </header>

      {docs.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      ) : (
        <p className="text-ink-600 dark:text-ink-200">S to oznako še ni objavljenih člankov.</p>
      )}

      <Pagination page={page} totalPages={totalPages} basePath={`/tag/${tag.slug}`} />
    </div>
  )
}

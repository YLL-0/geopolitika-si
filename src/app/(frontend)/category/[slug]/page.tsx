import type { Metadata } from 'next'

import { notFound } from 'next/navigation'
import React from 'react'

import { ArticleCard } from '@/components/ArticleCard'
import { Pagination } from '@/components/Pagination'
import { findArticles, findCategoryBySlug } from '@/lib/queries'

export const revalidate = 120

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await findCategoryBySlug(slug)
  if (!category) return {}
  return {
    title: category.name,
    description: category.description || `Članki iz rubrike ${category.name}.`,
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, { page: pageParam }] = await Promise.all([params, searchParams])
  const category = await findCategoryBySlug(slug)
  if (!category) notFound()

  const page = Math.max(1, Number(pageParam) || 1)
  const { docs, totalPages } = await findArticles({
    where: { category: { equals: category.id } },
    page,
    limit: 12,
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8 border-b-2 border-accent-700 pb-4">
        <h1 className="font-display text-3xl font-black uppercase tracking-wide text-ink-900">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-2 max-w-2xl font-serif text-ink-600">{category.description}</p>
        )}
      </header>

      {docs.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      ) : (
        <p className="text-ink-600">V tej rubriki še ni objavljenih člankov.</p>
      )}

      <Pagination page={page} totalPages={totalPages} basePath={`/category/${category.slug}`} />
    </div>
  )
}

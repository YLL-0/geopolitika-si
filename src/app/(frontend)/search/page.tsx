import type { Metadata } from 'next'

import React from 'react'

import { ArticleCard } from '@/components/ArticleCard'
import { Pagination } from '@/components/Pagination'
import { SearchForm } from '@/components/SearchForm'
import { searchArticles } from '@/lib/queries'
import type { Article } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Iskanje',
  robots: { index: false },
}

type Props = { searchParams: Promise<{ q?: string; page?: string }> }

export default async function SearchPage({ searchParams }: Props) {
  const { q = '', page: pageParam } = await searchParams
  const query = q.trim()
  const page = Math.max(1, Number(pageParam) || 1)

  const results = query ? await searchArticles(query, page) : null

  const articles: Article[] =
    results?.docs
      .map((hit) => (typeof hit.doc?.value === 'object' ? (hit.doc.value as Article) : null))
      .filter((a): a is Article => a !== null && a._status === 'published') ?? []

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8 border-b-2 border-ink-900 pb-4">
        <h1 className="mb-4 font-display text-3xl font-black tracking-tight text-ink-900">
          Iskanje
        </h1>
        <SearchForm defaultValue={query} />
      </header>

      {query && (
        <p className="mb-6 text-sm text-ink-600">
          {results?.totalDocs
            ? `Najdenih ${results.totalDocs} zadetkov za »${query}«.`
            : `Za »${query}« ni zadetkov. Poskusite z drugimi ključnimi besedami.`}
        </p>
      )}

      {articles.length > 0 && (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}

      {results && (
        <Pagination
          page={page}
          totalPages={results.totalPages}
          basePath="/search"
          extraQuery={`q=${encodeURIComponent(query)}`}
        />
      )}
    </div>
  )
}

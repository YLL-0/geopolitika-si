import type { Metadata } from 'next'

import Image from 'next/image'
import { notFound } from 'next/navigation'
import React from 'react'

import { ArticleCard } from '@/components/ArticleCard'
import { Pagination } from '@/components/Pagination'
import { mediaUrl } from '@/lib/format'
import { findArticles, findAuthorById } from '@/lib/queries'

export const revalidate = 120

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const author = await findAuthorById(Number(id))
  if (!author) return {}
  return { title: author.name, description: author.bio || `Članki avtorja ${author.name}.` }
}

export default async function AuthorPage({ params, searchParams }: Props) {
  const [{ id }, { page: pageParam }] = await Promise.all([params, searchParams])
  const authorId = Number(id)
  if (!Number.isInteger(authorId)) notFound()

  const author = await findAuthorById(authorId)
  if (!author) notFound()

  const page = Math.max(1, Number(pageParam) || 1)
  const { docs, totalPages } = await findArticles({
    where: { author: { equals: author.id } },
    page,
    limit: 12,
  })

  const avatarUrl = mediaUrl(author.avatar, 'thumbnail')

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8 flex items-center gap-5 border-b-2 border-accent-700 pb-6">
        {avatarUrl && (
          <Image
            src={avatarUrl}
            alt={author.name}
            width={80}
            height={80}
            className="h-20 w-20 rounded-full object-cover"
          />
        )}
        <div>
          <h1 className="text-3xl font-black tracking-tight">{author.name}</h1>
          {author.bio && (
            <p className="mt-1 max-w-2xl font-serif text-ink-600 dark:text-ink-200">{author.bio}</p>
          )}
        </div>
      </header>

      {docs.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      ) : (
        <p className="text-ink-600 dark:text-ink-200">Ta avtor še nima objavljenih člankov.</p>
      )}

      <Pagination page={page} totalPages={totalPages} basePath={`/author/${author.id}`} />
    </div>
  )
}

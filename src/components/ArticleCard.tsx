import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { formatDate, mediaAlt, mediaUrl } from '@/lib/format'
import type { Article } from '@/payload-types'

type Variant = 'hero' | 'card' | 'compact'

function categoryOf(article: Article) {
  return typeof article.category === 'object' ? article.category : null
}

function authorOf(article: Article) {
  return typeof article.author === 'object' ? article.author : null
}

export function ArticleCard({
  article,
  variant = 'card',
}: {
  article: Article
  variant?: Variant
}) {
  const resolvedVariant = variant
  const category = categoryOf(article)
  const author = authorOf(article)

  if (resolvedVariant === 'compact') {
    return (
      <article className="border-b border-ink-100 pb-3 last:border-0 last:pb-0">
        {category && (
          <Link
            href={`/category/${category.slug}`}
            className="text-xs font-bold uppercase tracking-wider text-accent-700 hover:underline"
          >
            {category.name}
          </Link>
        )}
        <h3 className="mt-1 font-display text-base font-bold leading-snug text-ink-900">
          <Link href={`/article/${article.slug}`} className="hover:text-accent-700">
            {article.title}
          </Link>
        </h3>
        <p className="mt-1 text-xs uppercase tracking-wide text-ink-400">
          {author ? author.name : formatDate(article.publishedAt)}
        </p>
      </article>
    )
  }

  const imageUrl = mediaUrl(article.featuredImage, resolvedVariant === 'hero' ? 'hero' : 'card')

  if (resolvedVariant === 'hero') {
    return (
      <article>
        {category && (
          <Link
            href={`/category/${category.slug}`}
            className="text-sm font-bold uppercase tracking-wider text-accent-700 hover:underline"
          >
            {category.name}
          </Link>
        )}
        <h2 className="mt-2 font-display text-3xl font-black leading-tight tracking-tight text-ink-900 md:text-4xl">
          <Link href={`/article/${article.slug}`} className="hover:text-accent-700">
            {article.title}
          </Link>
        </h2>
        {imageUrl && (
          <Link
            href={`/article/${article.slug}`}
            className="relative mt-4 block aspect-[16/9] overflow-hidden bg-ink-100"
          >
            <Image
              src={imageUrl}
              alt={mediaAlt(article.featuredImage)}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover"
            />
          </Link>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-y border-ink-200 py-2 text-xs uppercase tracking-wide text-ink-600">
          {author && <span className="font-semibold text-ink-900">Piše {author.name}</span>}
          {author && <span aria-hidden="true">·</span>}
          <time dateTime={article.publishedAt ?? undefined}>{formatDate(article.publishedAt)}</time>
        </div>
        {article.excerpt && (
          <p className="drop-cap mt-4 max-w-2xl font-serif text-lg leading-relaxed text-ink-800">
            {article.excerpt}
          </p>
        )}
        <Link
          href={`/article/${article.slug}`}
          className="mt-3 inline-block text-sm font-semibold uppercase tracking-wide text-accent-700 hover:underline"
        >
          Nadaljevanje prispevka →
        </Link>
      </article>
    )
  }

  return (
    <article className="group flex flex-col">
      <Link
        href={`/article/${article.slug}`}
        className="relative block aspect-[3/2] overflow-hidden bg-ink-100"
      >
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={mediaAlt(article.featuredImage)}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        )}
      </Link>
      <div className="flex flex-1 flex-col pt-3">
        {category && (
          <Link
            href={`/category/${category.slug}`}
            className="mb-1 text-xs font-bold uppercase tracking-wider text-accent-700 hover:underline"
          >
            {category.name}
          </Link>
        )}
        <h3 className="font-display text-lg font-bold leading-snug tracking-tight text-ink-900">
          <Link href={`/article/${article.slug}`} className="hover:text-accent-700">
            {article.title}
          </Link>
        </h3>
        <p className="mt-2 text-xs text-ink-400">
          <time dateTime={article.publishedAt ?? undefined}>{formatDate(article.publishedAt)}</time>
        </p>
      </div>
    </article>
  )
}

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { formatDate, mediaAlt, mediaUrl } from '@/lib/format'
import type { Article } from '@/payload-types'

function categoryOf(article: Article) {
  return typeof article.category === 'object' ? article.category : null
}

export function ArticleCard({ article, large = false }: { article: Article; large?: boolean }) {
  const category = categoryOf(article)
  const imageUrl = mediaUrl(article.featuredImage, large ? 'hero' : 'card')

  return (
    <article className="group flex flex-col">
      <Link
        href={`/article/${article.slug}`}
        className="relative block aspect-[3/2] overflow-hidden rounded-sm bg-ink-100 dark:bg-ink-800"
      >
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={mediaAlt(article.featuredImage)}
            fill
            sizes={large ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        )}
      </Link>
      <div className="flex flex-1 flex-col pt-3">
        {category && (
          <Link
            href={`/category/${category.slug}`}
            className="mb-1 text-xs font-bold uppercase tracking-wider text-accent-700 hover:underline dark:text-accent-100"
          >
            {category.name}
          </Link>
        )}
        <h3
          className={`font-bold leading-snug tracking-tight ${large ? 'text-2xl md:text-3xl' : 'text-lg'}`}
        >
          <Link href={`/article/${article.slug}`} className="hover:text-accent-700 dark:hover:text-accent-100">
            {article.title}
          </Link>
        </h3>
        {large && article.excerpt && (
          <p className="mt-2 line-clamp-3 font-serif text-ink-600 dark:text-ink-200">
            {article.excerpt}
          </p>
        )}
        <p className="mt-2 text-xs text-ink-400">
          <time dateTime={article.publishedAt ?? undefined}>{formatDate(article.publishedAt)}</time>
        </p>
      </div>
    </article>
  )
}

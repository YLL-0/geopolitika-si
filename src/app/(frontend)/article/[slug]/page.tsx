import type { Metadata } from 'next'

import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import Link from 'next/link'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import React from 'react'

import { ArticleCard } from '@/components/ArticleCard'
import { SectionHeading } from '@/components/SectionHeading'
import { ShareButtons } from '@/components/ShareButtons'
import { formatDate, mediaAlt, mediaUrl } from '@/lib/format'
import { readingTimeMinutes } from '@/lib/lexical'
import { findArticleBySlug, findRelatedArticles } from '@/lib/queries'

export const revalidate = 120

type Props = { params: Promise<{ slug: string }> }

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await findArticleBySlug(slug)
  if (!article) return {}

  const title = article.meta?.title || article.title
  const description = article.meta?.description || article.excerpt || undefined
  const ogImage =
    mediaUrl(article.meta?.image, 'og') ?? mediaUrl(article.featuredImage, 'og') ?? undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${serverURL}/article/${article.slug}`,
      publishedTime: article.publishedAt ?? undefined,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title,
      description,
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const { isEnabled: isDraft } = await draftMode()

  const article = await findArticleBySlug(slug, isDraft)
  if (!article) notFound()

  const category = typeof article.category === 'object' ? article.category : null
  const author = typeof article.author === 'object' ? article.author : null
  const heroUrl = mediaUrl(article.featuredImage, 'hero')
  const heroMedia = typeof article.featuredImage === 'object' ? article.featuredImage : null
  const minutes = readingTimeMinutes(article.body)
  const related = await findRelatedArticles(article)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <article className="mx-auto max-w-3xl">
        <header>
          {category && (
            <Link
              href={`/category/${category.slug}`}
              className="text-sm font-bold uppercase tracking-wider text-accent-700 hover:underline"
            >
              {category.name}
            </Link>
          )}
          <h1 className="mt-2 font-display text-3xl font-black leading-tight tracking-tight text-ink-900 md:text-5xl">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="mt-4 font-serif text-lg text-ink-600 md:text-xl">{article.excerpt}</p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 border-y border-ink-200 py-3 text-sm uppercase tracking-wide text-ink-600">
            {author && (
              <Link href={`/author/${author.id}`} className="font-semibold text-ink-900 hover:text-accent-700">
                Piše {author.name}
              </Link>
            )}
            {author && <span aria-hidden="true">·</span>}
            <time dateTime={article.publishedAt ?? undefined}>{formatDate(article.publishedAt)}</time>
            <span aria-hidden="true">·</span>
            <span>{minutes} min branja</span>
          </div>
        </header>

        {heroUrl && (
          <figure className="mt-6">
            <div className="relative aspect-[16/9] overflow-hidden bg-ink-100">
              <Image
                src={heroUrl}
                alt={mediaAlt(article.featuredImage)}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            </div>
            {heroMedia?.caption && (
              <figcaption className="mt-2 text-xs uppercase tracking-wide text-ink-400">
                {heroMedia.caption}
              </figcaption>
            )}
          </figure>
        )}

        <div className="article-body mt-8">
          <RichText data={article.body} />
        </div>

        {(article.tags?.length ?? 0) > 0 && (
          <ul className="mt-8 flex flex-wrap gap-2" aria-label="Oznake">
            {article.tags?.map((tag) =>
              typeof tag === 'object' ? (
                <li key={tag.id}>
                  <Link
                    href={`/tag/${tag.slug}`}
                    className="inline-block border border-ink-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink-600 hover:border-accent-600 hover:text-accent-700"
                  >
                    #{tag.name}
                  </Link>
                </li>
              ) : null,
            )}
          </ul>
        )}

        <div className="mt-8 border-t border-ink-200 pt-6">
          <ShareButtons url={`${serverURL}/article/${article.slug}`} title={article.title} />
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mx-auto mt-14 max-w-6xl">
          <SectionHeading id="related-heading" accent>
            Sorodni članki
          </SectionHeading>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

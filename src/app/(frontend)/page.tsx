import Link from 'next/link'
import React from 'react'

import { ArticleCard } from '@/components/ArticleCard'
import { findArticles, getCategories } from '@/lib/queries'

export const revalidate = 60

export default async function HomePage() {
  const [{ docs: featured }, { docs: latest }, categories] = await Promise.all([
    findArticles({ where: { featured: { equals: true } }, limit: 3 }),
    findArticles({ limit: 9 }),
    getCategories(),
  ])

  const hero = featured[0] ?? latest[0]
  const heroSecondary = featured.length > 1 ? featured.slice(1, 3) : latest.slice(1, 3)
  const heroIds = new Set([hero, ...heroSecondary].filter(Boolean).map((a) => a.id))
  const rest = latest.filter((a) => !heroIds.has(a.id)).slice(0, 6)

  const categorySections = await Promise.all(
    categories.map(async (category) => {
      const { docs } = await findArticles({
        where: { category: { equals: category.id } },
        limit: 3,
      })
      return { category, docs }
    }),
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {hero && <h1 className="sr-only">Naslovnica</h1>}
      {hero ? (
        <section aria-label="Izpostavljeno" className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <ArticleCard article={hero} large />
          </div>
          <div className="flex flex-col gap-6">
            {heroSecondary.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-sm border border-ink-200 p-10 text-center dark:border-ink-600">
          <h1 className="text-2xl font-bold">Dobrodošli</h1>
          <p className="mt-2 text-ink-600 dark:text-ink-200">
            Ko bodo objavljeni prvi članki, se bodo prikazali tukaj. Uredniki: prijavite se v{' '}
            <Link href="/admin" className="text-accent-700 underline dark:text-accent-100">
              nadzorno ploščo
            </Link>
            .
          </p>
        </section>
      )}

      {rest.length > 0 && (
        <section aria-labelledby="latest-heading" className="mt-12">
          <h2
            id="latest-heading"
            className="mb-5 border-b-2 border-ink-900 pb-2 text-xl font-black uppercase tracking-wide dark:border-ink-100"
          >
            Zadnji članki
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}

      {categorySections
        .filter(({ docs }) => docs.length > 0)
        .map(({ category, docs }) => (
          <section key={category.id} aria-labelledby={`cat-${category.slug}`} className="mt-12">
            <div className="mb-5 flex items-baseline justify-between border-b-2 border-accent-700 pb-2">
              <h2 id={`cat-${category.slug}`} className="text-xl font-black uppercase tracking-wide">
                {category.name}
              </h2>
              <Link
                href={`/category/${category.slug}`}
                className="text-sm font-semibold text-accent-700 hover:underline dark:text-accent-100"
              >
                Vse iz rubrike →
              </Link>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {docs.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </section>
        ))}
    </div>
  )
}

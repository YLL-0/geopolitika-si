import Link from 'next/link'
import React from 'react'

import { ArticleCard } from '@/components/ArticleCard'
import { SectionHeading } from '@/components/SectionHeading'
import { findArticles, getCategories } from '@/lib/queries'
import type { Article } from '@/payload-types'

export const revalidate = 60

export default async function HomePage() {
  const [{ docs: featured }, { docs: latest }, categories] = await Promise.all([
    findArticles({ where: { featured: { equals: true } }, limit: 3 }),
    findArticles({ limit: 18 }),
    getCategories(),
  ])

  const hero = featured[0] ?? latest[0]

  if (!hero) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <section className="border border-ink-200 p-10 text-center">
          <h1 className="font-display text-2xl font-bold text-ink-900">Dobrodošli</h1>
          <p className="mt-2 text-ink-600">
            Ko bodo objavljeni prvi članki, se bodo prikazali tukaj. Uredniki: prijavite se v{' '}
            <Link href="/admin" className="text-accent-700 underline">
              nadzorno ploščo
            </Link>
            .
          </p>
        </section>
      </div>
    )
  }

  const used = new Set<Article['id']>([hero.id])
  const take = (n: number): Article[] => {
    const picked = latest.filter((a) => !used.has(a.id)).slice(0, n)
    picked.forEach((a) => used.add(a.id))
    return picked
  }

  const analiza = categories.find((c) => c.name.toLowerCase() === 'analiza')
  const naKratko = analiza
    ? (
        await findArticles({
          where: { and: [{ category: { equals: analiza.id } }, { id: { not_equals: hero.id } }] },
          limit: 3,
        })
      ).docs
    : take(3)
  naKratko.forEach((a) => used.add(a.id))

  const zadnjeObjave = take(4)
  const izdaja = take(3)
  const rest = latest.filter((a) => !used.has(a.id))

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
      <h1 className="sr-only">Naslovnica</h1>

      <div className="grid gap-10 lg:grid-cols-[220px_1fr_260px]">
        {naKratko.length > 0 && (
          <aside className="order-2 lg:order-1 lg:col-start-1" aria-labelledby="na-kratko-heading">
            <SectionHeading id="na-kratko-heading">Na kratko</SectionHeading>
            <div className="flex flex-col gap-4">
              {naKratko.map((a) => (
                <ArticleCard key={a.id} article={a} variant="compact" />
              ))}
            </div>
          </aside>
        )}

        <section className="order-1 lg:order-2 lg:col-start-2" aria-label="Izpostavljeno">
          <ArticleCard article={hero} variant="hero" />
        </section>

        {zadnjeObjave.length > 0 && (
          <aside className="order-3 lg:col-start-3" aria-labelledby="zadnje-objave-heading">
            <SectionHeading id="zadnje-objave-heading">Zadnje objave</SectionHeading>
            <div className="flex flex-col gap-4">
              {zadnjeObjave.map((a) => (
                <ArticleCard key={a.id} article={a} variant="compact" />
              ))}
            </div>
          </aside>
        )}
      </div>

      {izdaja.length > 0 && (
        <section aria-labelledby="izdaja-heading" className="mt-14">
          <SectionHeading id="izdaja-heading">Iz današnje izdaje</SectionHeading>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {izdaja.map((a) => (
              <ArticleCard key={a.id} article={a} variant="card" />
            ))}
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section aria-labelledby="latest-heading" className="mt-14">
          <SectionHeading id="latest-heading">Zadnji članki</SectionHeading>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((a) => (
              <ArticleCard key={a.id} article={a} variant="card" />
            ))}
          </div>
        </section>
      )}

      {categorySections
        .filter(({ docs }) => docs.length > 0)
        .map(({ category, docs }) => (
          <section key={category.id} aria-labelledby={`cat-${category.slug}`} className="mt-14">
            <SectionHeading
              id={`cat-${category.slug}`}
              href={`/category/${category.slug}`}
              accent
            >
              {category.name}
            </SectionHeading>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {docs.map((a) => (
                <ArticleCard key={a.id} article={a} variant="card" />
              ))}
            </div>
          </section>
        ))}
    </div>
  )
}

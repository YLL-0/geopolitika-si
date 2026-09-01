import type { Metadata } from 'next'

import { RichText } from '@payloadcms/richtext-lexical/react'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import React from 'react'

import { findPageBySlug } from '@/lib/queries'

export const revalidate = 300

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await findPageBySlug(slug)
  if (!page) return {}
  return {
    title: page.meta?.title || page.title,
    description: page.meta?.description || undefined,
  }
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params
  const { isEnabled: isDraft } = await draftMode()

  const page = await findPageBySlug(slug, isDraft)
  if (!page) notFound()

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 font-display text-3xl font-black tracking-tight text-ink-900 md:text-4xl">
        {page.title}
      </h1>
      <div className="article-body">
        <RichText data={page.body} />
      </div>
    </div>
  )
}

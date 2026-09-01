import Link from 'next/link'
import React from 'react'

import { getPublishedPages, getSiteSettings } from '@/lib/queries'

const platformLabels: Record<string, string> = {
  facebook: 'Facebook',
  x: 'X',
  instagram: 'Instagram',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
}

export async function Footer() {
  const [settings, pages] = await Promise.all([getSiteSettings(), getPublishedPages()])
  const siteName = settings.siteName || 'Informbiro'
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 border-t-4 border-ink-900 bg-paper text-ink-800">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-bold uppercase tracking-tight text-ink-900">
            {siteName}
          </p>
          {settings.tagline && <p className="mt-1 text-sm text-ink-600">{settings.tagline}</p>}
          {settings.footerText && (
            <p className="mt-3 whitespace-pre-line text-sm text-ink-600">{settings.footerText}</p>
          )}
        </div>

        <nav aria-label="Strani">
          <p className="mb-2 text-sm font-bold uppercase tracking-wider text-ink-900">Strani</p>
          <ul className="space-y-1 text-sm">
            {pages.map((p) => (
              <li key={p.id}>
                <Link href={`/${p.slug}`} className="hover:text-accent-700 hover:underline">
                  {p.title}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/rss.xml" className="hover:text-accent-700 hover:underline">
                RSS
              </Link>
            </li>
          </ul>
        </nav>

        {(settings.socialLinks?.length ?? 0) > 0 && (
          <nav aria-label="Družbena omrežja">
            <p className="mb-2 text-sm font-bold uppercase tracking-wider text-ink-900">
              Spremljajte nas
            </p>
            <ul className="space-y-1 text-sm">
              {settings.socialLinks?.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent-700 hover:underline"
                  >
                    {platformLabels[link.platform] ?? link.platform}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      <div className="border-t border-ink-200 py-4 text-center text-xs uppercase tracking-wider text-ink-600">
        © {year} {siteName}. Vse pravice pridržane.
      </div>
    </footer>
  )
}

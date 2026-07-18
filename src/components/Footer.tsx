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
  const siteName = settings.siteName || 'Geopolitika SI'
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 border-t-4 border-accent-700 bg-ink-900 text-ink-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <p className="text-lg font-black tracking-tight text-white">{siteName}</p>
          {settings.tagline && <p className="mt-1 text-sm text-ink-200">{settings.tagline}</p>}
          {settings.footerText && (
            <p className="mt-3 whitespace-pre-line text-sm text-ink-400">{settings.footerText}</p>
          )}
        </div>

        <nav aria-label="Strani">
          <p className="mb-2 text-sm font-bold uppercase tracking-wider text-ink-400">Strani</p>
          <ul className="space-y-1 text-sm">
            {pages.map((p) => (
              <li key={p.id}>
                <Link href={`/${p.slug}`} className="hover:text-white hover:underline">
                  {p.title}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/rss.xml" className="hover:text-white hover:underline">
                RSS
              </Link>
            </li>
          </ul>
        </nav>

        {(settings.socialLinks?.length ?? 0) > 0 && (
          <nav aria-label="Družbena omrežja">
            <p className="mb-2 text-sm font-bold uppercase tracking-wider text-ink-400">
              Spremljajte nas
            </p>
            <ul className="space-y-1 text-sm">
              {settings.socialLinks?.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white hover:underline"
                  >
                    {platformLabels[link.platform] ?? link.platform}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      <div className="border-t border-ink-800 py-4 text-center text-xs text-ink-400">
        © {year} {siteName}. Vse pravice pridržane.
      </div>
    </footer>
  )
}

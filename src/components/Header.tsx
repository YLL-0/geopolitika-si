import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { mediaUrl } from '@/lib/format'
import { getCategories, getSiteSettings } from '@/lib/queries'
import { MobileNav } from './MobileNav'
import { SearchForm } from './SearchForm'

export async function Header() {
  const [settings, categories] = await Promise.all([getSiteSettings(), getCategories()])
  const logoUrl = mediaUrl(settings.logo, 'thumbnail')
  const siteName = settings.siteName || 'Geopolitika SI'

  const navItems = categories.map((c) => ({
    label: c.name,
    href: `/category/${c.slug}`,
  }))

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/95 backdrop-blur dark:border-ink-800 dark:bg-ink-900/95">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label={siteName}>
          {logoUrl ? (
            <Image src={logoUrl} alt={siteName} width={40} height={40} className="h-10 w-auto" />
          ) : (
            <span className="text-xl font-black tracking-tight">
              <span className="text-accent-700 dark:text-accent-100">●</span> {siteName}
            </span>
          )}
        </Link>

        <nav aria-label="Glavna navigacija" className="hidden flex-1 md:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-sm px-3 py-2 text-sm font-semibold uppercase tracking-wide text-ink-600 transition-colors hover:bg-ink-50 hover:text-accent-700 dark:text-ink-200 dark:hover:bg-ink-800 dark:hover:text-accent-100"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto hidden md:block">
          <SearchForm compact />
        </div>

        <MobileNav items={navItems} siteName={siteName} />
      </div>
    </header>
  )
}

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { mediaUrl } from '@/lib/format'
import { getCategories, getSiteSettings } from '@/lib/queries'
import { MobileNav } from './MobileNav'
import { NavLink } from './NavLink'
import { SearchForm } from './SearchForm'

export async function Header() {
  const [settings, categories] = await Promise.all([getSiteSettings(), getCategories()])
  const logoUrl = mediaUrl(settings.logo, 'thumbnail')
  const siteName = settings.siteName || 'Informbiro'

  const navItems = categories.map((c) => ({
    label: c.name,
    href: `/category/${c.slug}`,
  }))

  const dateLine = new Date()
    .toLocaleDateString('sl-SI', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    .toUpperCase()

  const biroIdx = siteName.toLowerCase().lastIndexOf('biro')
  const logoText =
    biroIdx >= 0 ? (
      <>
        {siteName.slice(0, biroIdx)}
        <span className="text-accent-700">{siteName.slice(biroIdx, biroIdx + 4)}</span>
        {siteName.slice(biroIdx + 4)}
      </>
    ) : (
      siteName
    )

  return (
    <header className="border-b border-ink-900 bg-paper">
      <div className="mx-auto max-w-6xl px-4 pt-6 pb-4 text-center">
        <Link href="/" className="inline-flex items-center gap-3" aria-label={siteName}>
          {logoUrl && (
            <Image src={logoUrl} alt="" width={36} height={36} className="h-9 w-auto shrink-0" />
          )}
          <span className="font-display text-5xl font-black uppercase tracking-tight text-ink-900 sm:text-6xl md:text-7xl">
            {logoText}
          </span>
        </Link>
        {settings.tagline && (
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-600 sm:text-sm">
            {settings.tagline}
          </p>
        )}
      </div>

      <div className="border-y border-ink-200 py-2 text-center text-xs font-semibold uppercase tracking-widest text-ink-600">
        {dateLine}
      </div>

      <div className="sticky top-0 z-40 border-b border-ink-900 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2.5">
          <Link
            href="/"
            className="font-display text-lg font-bold uppercase tracking-tight text-ink-900 md:hidden"
          >
            {siteName}
          </Link>

          <nav aria-label="Glavna navigacija" className="hidden flex-1 md:block">
            <ul className="flex flex-wrap items-center gap-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <NavLink
                    href={item.href}
                    className="block px-3 py-2 text-sm font-bold uppercase tracking-wide text-ink-800 transition-colors hover:text-accent-700"
                    activeClassName="text-accent-700"
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto hidden md:block">
            <SearchForm compact />
          </div>
          <MobileNav items={navItems} siteName={siteName} />
        </div>
      </div>
    </header>
  )
}

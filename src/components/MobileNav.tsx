'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'

type NavItem = { label: string; href: string }

export function MobileNav({ items, siteName }: { items: NavItem[]; siteName: string }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // close the menu on navigation
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname)
    setOpen(false)
  }

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? 'Zapri meni' : 'Odpri meni'}
        onClick={() => setOpen((v) => !v)}
        className="ml-auto flex h-10 w-10 items-center justify-center rounded-sm text-ink-800 hover:bg-ink-50 dark:text-ink-100 dark:hover:bg-ink-800"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full border-b border-ink-200 bg-white shadow-lg dark:border-ink-800 dark:bg-ink-900"
        >
          <nav aria-label={`${siteName} — mobilni meni`} className="mx-auto max-w-6xl px-4 py-3">
            <form action="/search" role="search" className="mb-3">
              <input
                type="search"
                name="q"
                placeholder="Išči …"
                aria-label="Iskanje"
                className="w-full rounded-sm border border-ink-200 bg-white px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-800"
              />
            </form>
            <ul className="flex flex-col">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block border-b border-ink-100 py-3 font-semibold uppercase tracking-wide text-ink-800 last:border-0 dark:border-ink-800 dark:text-ink-100"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </div>
  )
}

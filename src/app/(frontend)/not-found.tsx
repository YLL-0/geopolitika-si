import Link from 'next/link'
import React from 'react'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
      <p className="font-display text-7xl font-black text-ink-900">404</p>
      <div className="my-4 h-0.5 w-16 bg-accent-700" aria-hidden="true" />
      <h1 className="font-display text-2xl font-bold text-ink-900">Strani ni mogoče najti</h1>
      <p className="mt-2 max-w-md text-ink-600">
        Stran, ki jo iščete, ne obstaja ali pa je bila premaknjena. Poskusite z iskanjem ali se
        vrnite na naslovnico.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="border border-ink-900 bg-ink-900 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-paper hover:bg-accent-700 hover:border-accent-700"
        >
          Na naslovnico
        </Link>
        <Link
          href="/search"
          className="border border-ink-900 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-ink-900 hover:border-accent-600 hover:text-accent-700"
        >
          Iskanje
        </Link>
      </div>
    </div>
  )
}

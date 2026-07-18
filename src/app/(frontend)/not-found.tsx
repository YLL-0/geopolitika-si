import Link from 'next/link'
import React from 'react'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
      <p className="text-7xl font-black text-accent-700 dark:text-accent-100">404</p>
      <h1 className="mt-4 text-2xl font-bold">Strani ni mogoče najti</h1>
      <p className="mt-2 max-w-md text-ink-600 dark:text-ink-200">
        Stran, ki jo iščete, ne obstaja ali pa je bila premaknjena. Poskusite z iskanjem ali se
        vrnite na naslovnico.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-sm bg-accent-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-800"
        >
          Na naslovnico
        </Link>
        <Link
          href="/search"
          className="rounded-sm border border-ink-200 px-5 py-2.5 text-sm font-semibold hover:border-accent-600 hover:text-accent-700 dark:border-ink-600 dark:hover:text-accent-100"
        >
          Iskanje
        </Link>
      </div>
    </div>
  )
}

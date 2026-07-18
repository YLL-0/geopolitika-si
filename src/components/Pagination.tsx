import Link from 'next/link'
import React from 'react'

export function Pagination({
  page,
  totalPages,
  basePath,
  extraQuery = '',
}: {
  page: number
  totalPages: number
  basePath: string
  extraQuery?: string
}) {
  if (totalPages <= 1) return null

  const href = (p: number) => `${basePath}?${extraQuery ? `${extraQuery}&` : ''}page=${p}`
  const linkClass =
    'rounded-sm border border-ink-200 px-4 py-2 text-sm font-semibold hover:border-accent-600 hover:text-accent-700 dark:border-ink-600 dark:hover:text-accent-100'

  return (
    <nav aria-label="Strani rezultatov" className="mt-10 flex items-center justify-center gap-4">
      {page > 1 ? (
        <Link href={href(page - 1)} className={linkClass} rel="prev">
          ← Novejše
        </Link>
      ) : (
        <span aria-hidden="true" className="px-4 py-2 text-sm text-ink-200 dark:text-ink-600">← Novejše</span>
      )}
      <span className="text-sm text-ink-600 dark:text-ink-200">
        Stran {page} od {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={href(page + 1)} className={linkClass} rel="next">
          Starejše →
        </Link>
      ) : (
        <span aria-hidden="true" className="px-4 py-2 text-sm text-ink-200 dark:text-ink-600">Starejše →</span>
      )}
    </nav>
  )
}

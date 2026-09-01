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
    'border border-ink-900 px-4 py-2 text-xs font-bold uppercase tracking-wide text-ink-900 hover:bg-ink-900 hover:text-paper'

  return (
    <nav
      aria-label="Strani rezultatov"
      className="mt-10 flex items-center justify-center gap-4 border-t border-ink-200 pt-6"
    >
      {page > 1 ? (
        <Link href={href(page - 1)} className={linkClass} rel="prev">
          ← Novejše
        </Link>
      ) : (
        <span aria-hidden="true" className="px-4 py-2 text-xs uppercase tracking-wide text-ink-200">
          ← Novejše
        </span>
      )}
      <span className="text-xs uppercase tracking-wide text-ink-600">
        Stran {page} od {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={href(page + 1)} className={linkClass} rel="next">
          Starejše →
        </Link>
      ) : (
        <span aria-hidden="true" className="px-4 py-2 text-xs uppercase tracking-wide text-ink-200">
          Starejše →
        </span>
      )}
    </nav>
  )
}

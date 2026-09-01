import Link from 'next/link'
import React from 'react'

export function SectionHeading({
  id,
  children,
  href,
  linkLabel = 'Vse iz rubrike →',
  accent = false,
}: {
  id?: string
  children: React.ReactNode
  href?: string
  linkLabel?: string
  accent?: boolean
}) {
  return (
    <div
      className={`mb-5 flex items-baseline justify-between border-b-2 pb-2 ${
        accent ? 'border-accent-700' : 'border-ink-900'
      }`}
    >
      <h2
        id={id}
        className="font-display text-xl font-bold uppercase tracking-wide text-ink-900"
      >
        {children}
      </h2>
      {href && (
        <Link href={href} className="text-sm font-semibold text-accent-700 hover:underline">
          {linkLabel}
        </Link>
      )}
    </div>
  )
}

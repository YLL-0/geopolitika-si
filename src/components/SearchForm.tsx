import React from 'react'

export function SearchForm({ compact = false, defaultValue = '' }: { compact?: boolean; defaultValue?: string }) {
  return (
    <form action="/search" role="search" className={compact ? 'w-48' : 'w-full max-w-xl'}>
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Išči …"
        aria-label="Iskanje po člankih"
        className="w-full rounded-sm border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-accent-600 focus:outline-none dark:border-ink-600 dark:bg-ink-800 dark:text-ink-50"
      />
    </form>
  )
}

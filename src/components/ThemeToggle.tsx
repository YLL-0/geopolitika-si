'use client'

import React, { useSyncExternalStore } from 'react'

const listeners = new Set<() => void>()

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

const isDark = () => document.documentElement.classList.contains('dark')

export function ThemeToggle() {
  // server renders the light icon; the no-flash script in layout keeps the class in sync
  const dark = useSyncExternalStore(subscribe, isDark, () => false)

  const toggle = () => {
    const next = !isDark()
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {
      // localStorage unavailable — theme just won't persist
    }
    listeners.forEach((cb) => cb())
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Preklopi na svetli način' : 'Preklopi na temni način'}
      title={dark ? 'Svetli način' : 'Temni način'}
      className="flex h-10 w-10 items-center justify-center rounded-sm text-ink-600 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-ink-800"
    >
      {dark ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}

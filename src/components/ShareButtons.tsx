'use client'

import React, { useState } from 'react'

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false)

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const links = [
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { label: 'X', href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ]

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable (e.g. insecure context) — ignore
    }
  }

  const buttonClass =
    'border border-ink-900 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-ink-900 hover:bg-ink-900 hover:text-paper'

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Deli članek">
      <span className="text-xs font-bold uppercase tracking-wider text-ink-400">Deli:</span>
      {links.map((l) => (
        <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className={buttonClass}>
          {l.label}
        </a>
      ))}
      <button type="button" onClick={copy} className={buttonClass}>
        {copied ? 'Kopirano ✓' : 'Kopiraj povezavo'}
      </button>
      <button type="button" onClick={() => window.print()} className={buttonClass}>
        Natisni
      </button>
    </div>
  )
}

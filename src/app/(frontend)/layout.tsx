import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { Playfair_Display } from 'next/font/google'
import Link from 'next/link'
import React from 'react'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { getSiteSettings } from '@/lib/queries'
import './styles.css'

const displayFont = Playfair_Display({
  subsets: ['latin', 'latin-ext'],
  weight: ['700', '900'],
  variable: '--font-display-family',
  display: 'swap',
})

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

// favicon.ico is auto-injected by Next regardless of this field, but declaring
// any `icons` metadata suppresses auto-injection of the other file-convention
// icons (icon.svg, apple-icon.png) — so they're listed explicitly here too,
// alongside the extra PWA-style PNG sizes.
const icons: Metadata['icons'] = {
  icon: [
    { url: '/icon.svg', type: 'image/svg+xml' },
    { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
  ],
  apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSiteSettings()
    const siteName = settings.siteName || 'Informbiro'
    return {
      metadataBase: new URL(serverURL),
      title: {
        default: settings.defaultMeta?.title || siteName,
        template: `%s | ${siteName}`,
      },
      description: settings.defaultMeta?.description || settings.tagline || undefined,
      alternates: {
        types: { 'application/rss+xml': `${serverURL}/rss.xml` },
      },
      icons,
    }
  } catch {
    return { metadataBase: new URL(serverURL), title: 'Informbiro', icons }
  }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const { isEnabled: isDraft } = await draftMode()

  return (
    <html lang="sl" className={displayFont.variable}>
      <body className="flex min-h-screen flex-col">
        {isDraft && (
          <div className="bg-accent-700 px-4 py-2 text-center text-sm font-semibold text-white">
            Predogled osnutka —{' '}
            <Link href="/next/exit-preview" className="underline" prefetch={false}>
              izklopi predogled
            </Link>
          </div>
        )}
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}

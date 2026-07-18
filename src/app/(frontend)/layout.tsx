import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import React from 'react'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { getSiteSettings } from '@/lib/queries'
import './styles.css'

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSiteSettings()
    const siteName = settings.siteName || 'Geopolitika SI'
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
    }
  } catch {
    return { metadataBase: new URL(serverURL), title: 'Geopolitika SI' }
  }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const { isEnabled: isDraft } = await draftMode()

  return (
    <html lang="sl" suppressHydrationWarning>
      <head>
        <script
          // set .dark before paint to avoid a flash of the wrong theme
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
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

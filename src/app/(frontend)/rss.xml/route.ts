import { findArticles, getSiteSettings } from '@/lib/queries'

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export const revalidate = 600

const escapeXml = (s: string): string =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

export async function GET(): Promise<Response> {
  const [settings, { docs: articles }] = await Promise.all([
    getSiteSettings(),
    findArticles({ limit: 20 }),
  ])

  const siteName = settings.siteName || 'Geopolitika SI'

  const items = articles
    .map((a) => {
      const url = `${serverURL}/article/${a.slug}`
      return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      ${a.excerpt ? `<description>${escapeXml(a.excerpt)}</description>` : ''}
      ${a.publishedAt ? `<pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>` : ''}
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${serverURL}</link>
    <description>${escapeXml(settings.defaultMeta?.description || settings.tagline || siteName)}</description>
    <language>sl</language>
    <atom:link href="${serverURL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}

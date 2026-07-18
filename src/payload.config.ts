import { postgresAdapter } from '@payloadcms/db-postgres'
import { searchPlugin } from '@payloadcms/plugin-search'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { s3Storage } from '@payloadcms/storage-s3'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { sl } from '@payloadcms/translations/languages/sl'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Articles } from './collections/Articles'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Tags } from './collections/Tags'
import { Users } from './collections/Users'
import { SiteSettings } from './globals/SiteSettings'
import { lexicalToPlainText } from './lib/lexical'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Supabase Storage (S3-compatible). When the S3 vars are unset (local dev),
// uploads fall back to local disk instead.
const s3Enabled = Boolean(
  process.env.S3_BUCKET &&
    process.env.S3_ENDPOINT &&
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY,
)

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

const previewURL = (collection: 'articles' | 'pages', slug?: unknown): string => {
  const path = collection === 'articles' ? `/article/${slug}` : `/${slug}`
  return `${serverURL}/next/preview?path=${encodeURIComponent(path)}`
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    livePreview: {
      collections: ['articles', 'pages'],
      url: ({ data, collectionConfig }) =>
        previewURL(collectionConfig?.slug === 'pages' ? 'pages' : 'articles', data?.slug),
      breakpoints: [
        { label: 'Mobilni', name: 'mobile', width: 390, height: 844 },
        { label: 'Tablica', name: 'tablet', width: 768, height: 1024 },
        { label: 'Namizje', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  collections: [Articles, Categories, Tags, Media, Pages, Users],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  i18n: {
    supportedLanguages: { sl, en },
    fallbackLanguage: 'sl',
  },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
      // The PGlite dev database (pnpm dev:db) handles a limited number of sockets
      ...(process.env.DATABASE_POOL_MAX ? { max: Number(process.env.DATABASE_POOL_MAX) } : {}),
    },
  }),
  sharp,
  plugins: [
    seoPlugin({
      collections: ['articles', 'pages'],
      uploadsCollection: 'media',
      tabbedUI: true,
      generateTitle: ({ doc }) => doc?.title ?? '',
      generateDescription: ({ doc }) => doc?.excerpt ?? '',
    }),
    searchPlugin({
      collections: ['articles'],
      searchOverrides: {
        fields: ({ defaultFields }) => [
          ...defaultFields,
          { name: 'excerpt', type: 'textarea' },
          { name: 'bodyText', type: 'textarea' },
        ],
      },
      beforeSync: ({ originalDoc, searchDoc }) => ({
        ...searchDoc,
        excerpt: originalDoc?.excerpt ?? '',
        bodyText: lexicalToPlainText(originalDoc?.body),
      }),
    }),
    s3Storage({
      enabled: s3Enabled,
      collections: {
        media: { prefix: 'media' },
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'eu-central-1',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        // Supabase's S3 endpoint is path-style
        forcePathStyle: true,
      },
    }),
  ],
})

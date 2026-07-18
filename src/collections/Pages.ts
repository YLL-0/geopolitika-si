import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, publishedOrLoggedIn } from '../access/roles'
import { slugField } from '../fields/slug'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Stran', plural: 'Strani' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status'],
    group: 'Vsebina',
    preview: (doc) =>
      `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/next/preview?path=${encodeURIComponent(`/${doc?.slug}`)}`,
  },
  versions: {
    drafts: { autosave: { interval: 800 } },
    maxPerDoc: 15,
  },
  access: {
    read: publishedOrLoggedIn,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Naslov',
      required: true,
    },
    slugField('title'),
    {
      name: 'body',
      type: 'richText',
      label: 'Vsebina',
      required: true,
    },
  ],
}

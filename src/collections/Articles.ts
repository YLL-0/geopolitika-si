import type { CollectionConfig } from 'payload'

import { Forbidden } from 'payload'

import { adminEditorOrOwnAuthor, publishedOrLoggedIn } from '../access/roles'
import { slugField } from '../fields/slug'

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Članek', plural: 'Članki' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'author', '_status', 'publishedAt'],
    group: 'Vsebina',
    preview: (doc) =>
      `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/next/preview?path=${encodeURIComponent(`/article/${doc?.slug}`)}`,
  },
  versions: {
    drafts: { autosave: { interval: 800 } },
    maxPerDoc: 25,
  },
  access: {
    read: publishedOrLoggedIn,
    create: ({ req }) => Boolean(req.user),
    update: adminEditorOrOwnAuthor,
    delete: adminEditorOrOwnAuthor,
  },
  hooks: {
    beforeChange: [
      // Authors may only save drafts — publishing is for editors and admins.
      ({ req, data }) => {
        if (data?._status === 'published' && req.user && req.user.role === 'author') {
          throw new Forbidden(req.t)
        }
        return data
      },
      // Stamp publishedAt on first publish.
      ({ data }) => {
        if (data?._status === 'published' && !data.publishedAt) {
          data.publishedAt = new Date().toISOString()
        }
        return data
      },
    ],
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
      name: 'excerpt',
      type: 'textarea',
      label: 'Povzetek',
      admin: {
        description: 'Kratek uvod, prikazan na karticah in kot opis za iskalnike.',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Naslovna slika',
    },
    {
      name: 'body',
      type: 'richText',
      label: 'Vsebina',
      required: true,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Kategorija',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      label: 'Oznake',
      admin: { position: 'sidebar' },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      label: 'Avtor',
      defaultValue: ({ user }) => user?.id,
      admin: { position: 'sidebar' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Izpostavljen članek',
      defaultValue: false,
      access: {
        update: ({ req }) => ['admin', 'editor'].includes(req.user?.role ?? ''),
      },
      admin: {
        position: 'sidebar',
        description: 'Izpostavljeni članki se prikažejo na vrhu naslovnice.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Datum objave',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
  ],
}

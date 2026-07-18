import type { CollectionConfig } from 'payload'

import { isAdmin, isLoggedIn } from '../access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Medij', plural: 'Mediji' },
  admin: { group: 'Vsebina' },
  access: {
    read: () => true,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isAdmin,
  },
  upload: {
    imageSizes: [
      { name: 'thumbnail', width: 480, height: 320, position: 'centre' },
      { name: 'card', width: 768, height: 512, position: 'centre' },
      { name: 'hero', width: 1600, height: 900, position: 'centre' },
      { name: 'og', width: 1200, height: 630, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Nadomestno besedilo (alt)',
      required: true,
      admin: { description: 'Kratek opis slike za dostopnost in SEO.' },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Podnapis',
    },
  ],
}

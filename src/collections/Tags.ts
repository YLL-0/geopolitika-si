import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access/roles'
import { slugField } from '../fields/slug'

export const Tags: CollectionConfig = {
  slug: 'tags',
  labels: { singular: 'Oznaka', plural: 'Oznake' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
    group: 'Vsebina',
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Ime',
      required: true,
    },
    slugField('name'),
  ],
}

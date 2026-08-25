import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Uporabnik', plural: 'Uporabniki' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Administracija',
  },
  auth: true,
  access: {
    create: isAdmin,
    delete: isAdmin,
    // Logged-in users can see the user list (needed for author relationships);
    // users can update themselves, admins anyone.
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin') return true
      return { id: { equals: req.user.id } }
    },
  },
  hooks: {
    beforeChange: [
      // The very first user is created via Payload's "create first user" screen,
      // which bypasses access control since no admin exists yet to authorize it.
      // Without this, they'd get the 'role' field's default ('author') and no one
      // could ever grant them admin — a permanent lockout.
      async ({ operation, data, req }) => {
        if (operation !== 'create') return data
        const { totalDocs } = await req.payload.count({ collection: 'users' })
        if (totalDocs === 0) {
          data.role = 'admin'
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Ime in priimek',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      label: 'Vloga',
      required: true,
      defaultValue: 'author',
      saveToJWT: true,
      options: [
        { label: 'Administrator', value: 'admin' },
        { label: 'Urednik', value: 'editor' },
        { label: 'Avtor', value: 'author' },
      ],
      access: {
        // only admins may change roles
        update: ({ req }) => req.user?.role === 'admin',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Kratek opis',
      admin: { description: 'Prikazan na avtorjevi strani.' },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      label: 'Slika avtorja',
    },
  ],
}

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

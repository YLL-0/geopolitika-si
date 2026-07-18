import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access/roles'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Nastavitve strani',
  admin: { group: 'Administracija' },
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      label: 'Ime strani',
      required: true,
      defaultValue: 'Geopolitika SI',
    },
    {
      name: 'tagline',
      type: 'text',
      label: 'Slogan',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Logotip',
      admin: { description: 'Če logotip ni naložen, se v glavi izpiše ime strani.' },
    },
    {
      name: 'socialLinks',
      type: 'array',
      label: 'Družbena omrežja',
      labels: { singular: 'Povezava', plural: 'Povezave' },
      fields: [
        {
          name: 'platform',
          type: 'select',
          label: 'Platforma',
          required: true,
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'X (Twitter)', value: 'x' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'LinkedIn', value: 'linkedin' },
          ],
        },
        {
          name: 'url',
          type: 'text',
          label: 'URL',
          required: true,
        },
      ],
    },
    {
      name: 'footerText',
      type: 'textarea',
      label: 'Besedilo v nogi',
    },
    {
      name: 'defaultMeta',
      type: 'group',
      label: 'Privzeti SEO podatki',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Privzeti meta naslov',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Privzeti meta opis',
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Privzeta slika za deljenje (OG)',
        },
      ],
    },
  ],
}

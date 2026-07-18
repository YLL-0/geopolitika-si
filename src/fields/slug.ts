import type { FieldHook, TextField } from 'payload'

export const formatSlug = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    // strip diacritics (č → c, š → s, ž → z …)
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

const generateFromTitle =
  (sourceField: string): FieldHook =>
  ({ value, data }) => {
    if (typeof value === 'string' && value.length > 0) return formatSlug(value)
    const source = data?.[sourceField]
    if (typeof source === 'string' && source.length > 0) return formatSlug(source)
    return value
  }

/** URL slug, auto-generated from `sourceField` when left empty, editable, unique. */
export const slugField = (sourceField = 'title'): TextField => ({
  name: 'slug',
  type: 'text',
  label: 'URL naslov (slug)',
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Pusti prazno za samodejno tvorbo iz naslova.',
  },
  hooks: {
    beforeValidate: [generateFromTitle(sourceField)],
  },
})

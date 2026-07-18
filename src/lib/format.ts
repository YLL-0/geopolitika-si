import type { Media } from '../payload-types'

export function formatDate(date: string | null | undefined): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('sl-SI', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

type MediaLike = Media | number | null | undefined

type MediaSize = 'thumbnail' | 'card' | 'hero' | 'og'

/** URL of an upload at a given size, falling back to the original file. */
export function mediaUrl(media: MediaLike, size?: MediaSize): string | null {
  if (!media || typeof media === 'number') return null
  if (size) {
    const sized = media.sizes?.[size]
    if (sized?.url) return sized.url
  }
  return media.url ?? null
}

export function mediaAlt(media: MediaLike): string {
  if (!media || typeof media === 'number') return ''
  return media.alt ?? ''
}

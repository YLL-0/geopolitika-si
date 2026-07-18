import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

import config from '@/payload.config'

/** Enables Next.js draft mode for logged-in CMS users, then redirects to the previewed path. */
export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path') || '/'

  if (!path.startsWith('/')) {
    return new Response('Neveljavna pot.', { status: 400 })
  }

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: new Headers(req.headers) })

  const draft = await draftMode()

  if (!user) {
    draft.disable()
    return new Response('Za predogled se prijavite v nadzorno ploščo.', { status: 403 })
  }

  draft.enable()
  redirect(path)
}

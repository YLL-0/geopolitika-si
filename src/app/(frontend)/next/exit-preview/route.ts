import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path') || '/'
  const draft = await draftMode()
  draft.disable()
  redirect(path.startsWith('/') ? path : '/')
}

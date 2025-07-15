import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const redirectTo = searchParams.get('redirect') || '/'

  // Disable Draft Mode
  const draft = await draftMode()
  draft.disable()

  // Redirect to the requested page or homepage
  redirect(redirectTo)
}
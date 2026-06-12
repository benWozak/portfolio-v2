import type { Access } from 'payload'

/** Any logged-in admin user. */
export const authenticated: Access = ({ req }) => Boolean(req.user)

/**
 * Only allows creating a user when none exist (first-user onboarding /
 * post-reset). Local API scripts bypass access control, so db resets and
 * seeds are unaffected.
 */
export const onlyFirstUser: Access = async ({ req }) => {
  const { totalDocs } = await req.payload.count({ collection: 'users' })
  return totalDocs === 0
}

/** A user may only update their own account. */
export const selfOnly: Access = ({ req, id }) =>
  Boolean(req.user && id && String(req.user.id) === String(id))

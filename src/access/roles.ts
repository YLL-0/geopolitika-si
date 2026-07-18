import type { Access, AccessArgs } from 'payload'

type Role = 'admin' | 'editor' | 'author'

const hasRole = ({ req }: AccessArgs, roles: Role[]): boolean =>
  Boolean(req.user && roles.includes(req.user.role as Role))

export const isAdmin: Access = (args) => hasRole(args, ['admin'])

export const isAdminOrEditor: Access = (args) => hasRole(args, ['admin', 'editor'])

export const isLoggedIn: Access = ({ req }) => Boolean(req.user)

/** Public sees only published docs; logged-in users see drafts too. */
export const publishedOrLoggedIn: Access = ({ req }) =>
  req.user ? true : { _status: { equals: 'published' } }

/** Admins/editors edit everything; authors only their own articles. */
export const adminEditorOrOwnAuthor: Access = ({ req }) => {
  if (!req.user) return false
  if (['admin', 'editor'].includes(req.user.role as string)) return true
  return { author: { equals: req.user.id } }
}

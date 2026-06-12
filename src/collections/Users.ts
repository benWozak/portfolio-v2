import type { CollectionConfig } from 'payload'
import { authenticated, onlyFirstUser, selfOnly } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'System',
  },
  auth: true,
  access: {
    // Single-owner site: only the first user (fresh DB) can be created via
    // the API/admin; existing users can read the list and edit themselves.
    create: onlyFirstUser,
    read: authenticated,
    update: selfOnly,
    delete: () => false,
  },
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
}

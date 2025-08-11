import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Blog } from './collections/Blog'
import { Categories } from './collections/Categories'
import { Tags } from './collections/Tags'
import { BlogPage } from './collections/BlogPage'
import { ProfessionalInsights } from './collections/ProfessionalInsights'
import { Tutorials } from './collections/Tutorials'
import { Projects } from './collections/Projects'
import { Resume } from './collections/Resume'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '- Ben Wozak',
    },
    components: {
      graphics: {
        Logo: {
          path: './components/admin/PayloadLogo',
        },
        Icon: {
          path: './components/admin/PayloadIcon', 
        },
      },
    },
  },
  upload: {
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB
    },
  },
  collections: [Users, Media, Blog, Categories, Tags, BlogPage, ProfessionalInsights, Tutorials, Projects, Resume],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || '',
      authToken: process.env.DATABASE_AUTH_TOKEN || '',
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    vercelBlobStorage({
      enabled: true,
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
})

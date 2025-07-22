// Database reset script for PayloadCMS
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'

async function resetDatabase() {
  try {
    console.log('🔄 Connecting to database...')
    const payload = await getPayload({ config })
    
    console.log('🗑️  Clearing users collection...')
    const users = await payload.find({
      collection: 'users',
      limit: 1000
    })
    
    for (const user of users.docs) {
      await payload.delete({
        collection: 'users',
        id: user.id
      })
    }
    
    console.log('✅ Database reset complete! Users cleared.')
    console.log('🎯 You can now visit /admin to create the first user.')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error resetting database:', error)
    process.exit(1)
  }
}

resetDatabase()
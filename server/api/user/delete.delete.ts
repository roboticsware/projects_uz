import { eq } from 'drizzle-orm'
import { users } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const db = useDb()
  
  // The projectProgress records will be automatically deleted because of the 
  // 'onDelete: cascade' rule defined in the schema.
  await db.delete(users).where(eq(users.id, session.user.id))
  
  // Clear the nuxt-auth-utils session
  await clearUserSession(event)

  return { success: true }
})

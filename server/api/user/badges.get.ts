import { eq } from 'drizzle-orm'
import { projectProgress } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const db = useDb()
  
  // Fetch user's completed projects
  const records = await db.select().from(projectProgress).where(eq(projectProgress.userId, session.user.id)).all()
  
  // Return formatted badge data
  return records.map(record => ({
    id: record.id,
    projectSlug: record.projectSlug,
    // In a real app, you would join this with the Content table or map it manually
    projectName: record.projectSlug.split('/').pop()?.replace(/-/g, ' ').toUpperCase(),
    earnedAt: record.completedAt
  }))
})

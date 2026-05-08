import { eq } from 'drizzle-orm'
import { userProjects, userProjectTranslations } from '../../database/schema'
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const db = useDb()

  const projects = await db.query.userProjects.findMany({
    where: (p: any, { eq }: any) => eq(p.authorId, session.user.id),
    orderBy: (p: any, { desc }: any) => [desc(p.updatedAt)],
    with: {
      translations: true
    }
  })

  return projects
})

import { eq } from 'drizzle-orm'
import { userProjects } from '../../database/schema'
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401 })

  const allowedRoles = ['sub_admin', 'admin']
  if (!allowedRoles.includes(session.user.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const db = useDb()

  const projects = await db.query.userProjects.findMany({
    orderBy: (p: any, { desc }: any) => [desc(p.updatedAt)],
    with: {
      author: true,
      translations: true,
    }
  })

  return projects
})

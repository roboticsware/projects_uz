import { eq, and } from 'drizzle-orm'
import { userProjects } from '../../database/schema'
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { projectId } = await readBody(event)
  if (!projectId) {
    throw createError({ statusCode: 400, statusMessage: 'projectId is required' })
  }

  const db = useDb()

  // 내 프로젝트인지 확인
  const project = await db.query.userProjects.findFirst({
    where: (p: any, { and, eq }: any) => and(
      eq(p.id, projectId),
      eq(p.authorId, session.user.id)
    )
  })

  if (!project) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  }
  if (project.status !== 'draft' && project.status !== 'rejected') {
    throw createError({ statusCode: 400, statusMessage: 'Only draft or rejected projects can be submitted' })
  }

  await db.update(userProjects)
    .set({ status: 'review', updatedAt: new Date() })
    .where(eq(userProjects.id, projectId))

  return { success: true, status: 'review' }
})

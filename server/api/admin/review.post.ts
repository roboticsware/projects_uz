import { eq } from 'drizzle-orm'
import { userProjects, contentReviews } from '../../database/schema'
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401 })

  const allowedRoles = ['sub_admin', 'admin']
  if (!allowedRoles.includes(session.user.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const { projectId, status, comment } = await readBody(event)

  if (!projectId || !['approved', 'rejected', 'revision'].includes(status)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid parameters' })
  }

  const db = useDb()
  const now = new Date()

  // 프로젝트 상태 업데이트
  const newStatus = status === 'approved' ? 'published' : status === 'rejected' ? 'rejected' : 'draft'
  await db.update(userProjects)
    .set({ status: newStatus, updatedAt: now })
    .where(eq(userProjects.id, projectId))

  // 심사 기록 저장
  await db.insert(contentReviews).values({
    projectId,
    reviewerId: session.user.id,
    status,
    comment: comment || null,
    reviewedAt: now,
  })

  return { success: true, newStatus }
})

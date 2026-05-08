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

  // 소유권 확인 후 삭제 (Cascade 옵션 덕분에 번역 테이블도 함께 지워짐)
  const result = await db.delete(userProjects)
    .where(
      and(
        eq(userProjects.id, projectId),
        eq(userProjects.authorId, session.user.id)
      )
    )

  return { success: true }
})

import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401 })

  // 역할 변경은 admin만 가능
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Only admin can change roles' })
  }

  const { userId, role } = await readBody(event)

  const allowedRoles = ['student', 'teacher', 'sub_admin', 'admin']
  if (!userId || !allowedRoles.includes(role)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid parameters' })
  }

  // 자기 자신의 역할은 변경 불가
  if (userId === session.user.id) {
    throw createError({ statusCode: 400, statusMessage: 'Cannot change your own role' })
  }

  const db = useDb()
  await db.update(users)
    .set({ role })
    .where(eq(users.id, userId))

  return { success: true }
})

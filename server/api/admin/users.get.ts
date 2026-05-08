import { useDb } from '../../utils/db'
import { users } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401 })

  const allowedRoles = ['sub_admin', 'admin']
  if (!allowedRoles.includes(session.user.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const db = useDb()
  const allUsers = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    avatar: users.avatar,
    role: users.role,
    createdAt: users.createdAt,
  }).from(users).all()

  return allUsers
})

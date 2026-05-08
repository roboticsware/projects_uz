import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { users } from '~~/server/database/schema'

// Helper to hash password
function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hashedPassword = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hashedPassword}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password, name, role } = body

  if (!email || !password || !name) {
    throw createError({ statusCode: 400, message: 'All fields are required' })
  }

  // role 값 검증 (가입 시에는 student 또는 teacher만 허용)
  const allowedRoles = ['student', 'teacher']
  const userRole = allowedRoles.includes(role) ? role : 'student'

  const db = useDb()

  // Check if user already exists
  const existingUser = await db.select().from(users).where(eq(users.email, email)).get()
  if (existingUser) {
    throw createError({ statusCode: 409, message: 'User already exists' })
  }

  // Create new user
  const newUser = await db.insert(users).values({
    email,
    password: hashPassword(password),
    name,
    role: userRole,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
  }).returning().get()

  // Automatically log in after registration
  await setUserSession(event, {
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      avatar: newUser.avatar,
      role: newUser.role,
    }
  })

  return { success: true }
})

import { scryptSync, timingSafeEqual } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { users } from '~~/server/database/schema'

// Helper to verify password
function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(':')
  const hashedPassword = scryptSync(password, salt, 64).toString('hex')
  return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(hashedPassword, 'hex'))
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({ statusCode: 400, message: 'Email and password are required' })
  }

  const db = useDb()
  const user = await db.select().from(users).where(eq(users.email, email)).get()

  if (!user || !user.password || !verifyPassword(password, user.password)) {
    throw createError({ statusCode: 401, message: 'Invalid email or password' })
  }

  // Set user session
  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar
    }
  })

  return { success: true }
})

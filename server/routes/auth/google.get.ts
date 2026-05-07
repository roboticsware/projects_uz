import { eq } from 'drizzle-orm'
import { users } from '~~/server/database/schema'

export default defineOAuthGoogleEventHandler({
  config: {
    emailRequired: true
  },
  async onSuccess(event, { user, tokens }) {
    const db = useDb()
    
    // Check if user exists in database
    let dbUser = await db.select().from(users).where(eq(users.googleId, user.sub)).get()
    
    // If not, create them
    if (!dbUser) {
      const newUser = await db.insert(users).values({
        googleId: user.sub,
        email: user.email,
        name: user.name,
        avatar: user.picture
      }).returning().get()
      
      dbUser = newUser
    }

    // Set user session with Nuxt Auth Utils
    await setUserSession(event, {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        avatar: dbUser.avatar
      }
    })

    // Redirect to home page or previous page
    return sendRedirect(event, '/')
  },
  onError(event, error) {
    console.error('Google OAuth Error:', error)
    return sendRedirect(event, '/?error=auth-failed')
  }
})

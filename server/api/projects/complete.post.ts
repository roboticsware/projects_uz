import { eq, and } from 'drizzle-orm'
import { users, projectProgress } from '~~/server/database/schema'
import { serverQueryContent } from '#content/server'

export default defineEventHandler(async (event) => {
  // Check auth session
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody(event)
  const { projectSlug } = body

  if (!projectSlug) {
    throw createError({ statusCode: 400, message: 'Missing project slug' })
  }

  const db = useDb()

  // 1. Save progress (if not already completed)
  const existing = await db.select().from(projectProgress).where(
    and(
      eq(projectProgress.userId, session.user.id),
      eq(projectProgress.projectSlug, projectSlug)
    )
  ).get()

  if (!existing) {
    await db.insert(projectProgress).values({
      userId: session.user.id,
      projectSlug: projectSlug
    })
  }

  // 2. Recommend next project (Simple logic: find projects in same category/difficulty)
  // Fetch all content to find a recommendation
  const allProjects = await serverQueryContent(event, '/projects').find()
  
  // Exclude already completed
  const completedRecords = await db.select().from(projectProgress).where(eq(projectProgress.userId, session.user.id)).all()
  const completedSlugs = completedRecords.map(r => r.projectSlug)
  
  const availableProjects = allProjects.filter(p => !completedSlugs.includes(p._path?.split('/').pop() || ''))
  
  // Randomly pick one for now (or could base on current project's tags)
  const nextProject = availableProjects.length > 0 ? availableProjects[Math.floor(Math.random() * availableProjects.length)] : null

  return {
    success: true,
    nextProject: nextProject ? {
      title: nextProject.title,
      description: nextProject.description,
      _path: nextProject._path
    } : null
  }
})

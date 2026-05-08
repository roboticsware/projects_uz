import { eq } from 'drizzle-orm'
import { userProjects, userProjectTranslations } from '../../database/schema'
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const { title, description, difficulty, technology, hardware, content, locale = 'uz', projectId } = body

  if (!title?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Title is required' })
  }

  const db = useDb()
  const now = new Date()

  // 슬러그 자동 생성: 제목 기반
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣а-яёА-ЯЁ\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 60) + '-' + Date.now().toString(36)

  if (projectId) {
    // 기존 초안 업데이트
    await db.update(userProjects)
      .set({ updatedAt: now })
      .where(eq(userProjects.id, projectId))

    const existing = await db.query.userProjectTranslations.findFirst({
      where: (t: any, { and }: any) => and(
        eq(t.projectId, projectId),
        eq(t.locale, locale)
      )
    })

    if (existing) {
      await db.update(userProjectTranslations)
        .set({
          title, description, difficulty,
          technology: JSON.stringify(technology || []),
          hardware: JSON.stringify(hardware || []),
          content, updatedAt: now
        })
        .where(eq(userProjectTranslations.id, existing.id))
    } else {
      await db.insert(userProjectTranslations).values({
        projectId,
        locale, title, description, difficulty,
        technology: JSON.stringify(technology || []),
        hardware: JSON.stringify(hardware || []),
        content, createdAt: now, updatedAt: now
      })
    }
    return { success: true, projectId }
  } else {
    // 새 프로젝트 생성
    const [newProject] = await db.insert(userProjects).values({
      authorId: session.user.id,
      slug,
      primaryLocale: locale,
      status: 'draft',
      createdAt: now,
      updatedAt: now
    }).returning()

    await db.insert(userProjectTranslations).values({
      projectId: newProject.id,
      locale, title, description, difficulty,
      technology: JSON.stringify(technology || []),
      hardware: JSON.stringify(hardware || []),
      content, createdAt: now, updatedAt: now
    })

    return { success: true, projectId: newProject.id }
  }
})

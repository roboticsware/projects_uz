import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  googleId: text('google_id').unique(),
  email: text('email').notNull().unique(),
  password: text('password'),
  name: text('name').notNull(),
  avatar: text('avatar'),
  role: text('role').notNull().default('student'), // student | teacher | sub_admin | admin
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(userProjects),
  progress: many(projectProgress),
}))

export const projectProgress = sqliteTable('project_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  projectSlug: text('project_slug').notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// UGC: 사용자가 직접 작성한 프로젝트 메타정보
export const userProjects = sqliteTable('user_projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  authorId: integer('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  slug: text('slug').unique(),                // URL 경로
  primaryLocale: text('primary_locale').notNull().default('uz'),
  status: text('status').notNull().default('draft'), // draft | review | published | rejected
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const userProjectsRelations = relations(userProjects, ({ one, many }) => ({
  author: one(users, {
    fields: [userProjects.authorId],
    references: [users.id],
  }),
  translations: many(userProjectTranslations),
}))

// UGC: 언어별 콘텐츠 (본문 + 메타)
export const userProjectTranslations = sqliteTable('user_project_translations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => userProjects.id, { onDelete: 'cascade' }),
  locale: text('locale').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  difficulty: text('difficulty'),
  technology: text('technology'),
  hardware: text('hardware'),
  content: text('content'),
  translatedBy: integer('translated_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const userProjectTranslationsRelations = relations(userProjectTranslations, ({ one }) => ({
  project: one(userProjects, {
    fields: [userProjectTranslations.projectId],
    references: [userProjects.id],
  }),
}))

// UGC: 관리자 심사 기록
export const contentReviews = sqliteTable('content_reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => userProjects.id, { onDelete: 'cascade' }),
  reviewerId: integer('reviewer_id').references(() => users.id),
  status: text('status').notNull(),
  comment: text('comment'),
  reviewedAt: integer('reviewed_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

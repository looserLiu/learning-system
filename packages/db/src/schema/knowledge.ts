import { pgTable, uuid, text, integer, boolean, timestamp, jsonb, pgEnum, primaryKey } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users.ts'
import { studySessions } from './progress.ts'
import { notes } from './notes.ts'

export const knowledgeTypeEnum = pgEnum('knowledge_type', ['article', 'video', 'code', 'podcast'])
export const difficultyEnum = pgEnum('difficulty', ['beginner', 'intermediate', 'advanced'])

export const knowledgeItems = pgTable('knowledge_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  contentHtml: text('content_html'),
  type: knowledgeTypeEnum('type').default('article').notNull(),
  category: text('category'),
  difficulty: difficultyEnum('difficulty').default('beginner').notNull(),
  estimatedMinutes: integer('estimated_minutes'),
  metadata: jsonb('metadata').default({}),
  isPublished: boolean('is_published').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const tags = pgTable('tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  color: text('color'),
})

export const knowledgeTags = pgTable('knowledge_tags', {
  knowledgeId: uuid('knowledge_id').notNull().references(() => knowledgeItems.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.knowledgeId, t.tagId] }),
}))

export const knowledgeRelations = relations(knowledgeItems, ({ one, many }) => ({
  user: one(users, { fields: [knowledgeItems.userId], references: [users.id] }),
  tags: many(knowledgeTags),
  studySessions: many(studySessions),
  notes: many(notes),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  knowledgeItems: many(knowledgeTags),
}))

export const knowledgeTagsRelations = relations(knowledgeTags, ({ one }) => ({
  knowledge: one(knowledgeItems, { fields: [knowledgeTags.knowledgeId], references: [knowledgeItems.id] }),
  tag: one(tags, { fields: [knowledgeTags.tagId], references: [tags.id] }),
}))

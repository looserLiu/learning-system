import { pgTable, uuid, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
import { knowledgeItems } from './knowledge'

export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  knowledgeId: uuid('knowledge_id').notNull().references(() => knowledgeItems.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  highlights: jsonb('highlights').default([]).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  userKnowledgeIdx: index('notes_user_knowledge_idx').on(t.userId, t.knowledgeId),
}))

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, { fields: [notes.userId], references: [users.id] }),
  knowledge: one(knowledgeItems, { fields: [notes.knowledgeId], references: [knowledgeItems.id] }),
}))

import { pgTable, uuid, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
import { knowledgeItems } from './knowledge'

export const aiConversations = pgTable('ai_conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  knowledgeId: uuid('knowledge_id').references(() => knowledgeItems.id, { onDelete: 'set null' }),
  model: text('model').notNull(),
  messages: jsonb('messages').notNull().default([]),
  totalTokens: integer('total_tokens').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const aiConversationsRelations = relations(aiConversations, ({ one }) => ({
  user: one(users, { fields: [aiConversations.userId], references: [users.id] }),
  knowledge: one(knowledgeItems, { fields: [aiConversations.knowledgeId], references: [knowledgeItems.id] }),
}))

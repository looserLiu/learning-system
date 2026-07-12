import { pgTable, uuid, text, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { knowledgeItems } from './knowledge'
import { studySessions } from './progress'
import { notes } from './notes'

export const userRoleEnum = pgEnum('user_role', ['learner', 'admin'])

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  role: userRoleEnum('role').default('learner').notNull(),
  preferences: jsonb('preferences').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const usersRelations = relations(users, ({ many }) => ({
  knowledgeItems: many(knowledgeItems),
  studySessions: many(studySessions),
  notes: many(notes),
}))

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

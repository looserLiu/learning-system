import { pgTable, uuid, text, integer, timestamp, doublePrecision, pgEnum, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users.ts'
import { knowledgeItems } from './knowledge.ts'

export const studyTypeEnum = pgEnum('study_session_type', ['learn', 'review', 'practice'])

export const studySessions = pgTable('study_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  knowledgeId: uuid('knowledge_id').notNull().references(() => knowledgeItems.id, { onDelete: 'cascade' }),
  type: studyTypeEnum('type').default('learn').notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  durationSeconds: integer('duration_seconds'),
  focusScore: integer('focus_score'),
  progressPercent: doublePrecision('progress_percent'),
  intervalDays: integer('interval_days').default(0).notNull(),
  easeFactor: doublePrecision('ease_factor').default(2.5).notNull(),
  repsCount: integer('reps_count').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  userStartedIdx: index('study_user_started_idx').on(t.userId, t.startedAt),
}))

export const studySessionsRelations = relations(studySessions, ({ one }) => ({
  user: one(users, { fields: [studySessions.userId], references: [users.id] }),
  knowledge: one(knowledgeItems, { fields: [studySessions.knowledgeId], references: [knowledgeItems.id] }),
}))

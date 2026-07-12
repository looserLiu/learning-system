import { eq, and, desc, sql, gte, lte } from 'drizzle-orm'
import { db } from '@lms/db'
import { studySessions, knowledgeItems } from '@lms/db'
import { ErrorCode, AppError } from '@lms/shared'

export async function startSession(userId: string, knowledgeId: string, type: string) {
  const [knowledge] = await db.select().from(knowledgeItems).where(eq(knowledgeItems.id, knowledgeId))
  if (!knowledge) throw new AppError(ErrorCode.NOT_FOUND, '知识条目不存在')

  const [session] = await db.insert(studySessions).values({
    userId,
    knowledgeId,
    type: type || 'learn',
    startedAt: new Date(),
  }).returning()

  return session
}

export async function endSession(userId: string, sessionId: string, rating: number, progressPercent?: number) {
  const [session] = await db.select().from(studySessions).where(
    and(eq(studySessions.id, sessionId), eq(studySessions.userId, userId))
  )
  if (!session) throw new AppError(ErrorCode.NOT_FOUND, '学习会话不存在')
  if (session.endedAt) throw new AppError(ErrorCode.UNPROCESSABLE, '会话已结束')

  const endedAt = new Date()
  const durationSeconds = Math.floor((endedAt.getTime() - session.startedAt.getTime()) / 1000)

  // SM-2 Algorithm
  const sm2 = calculateSM2(rating, {
    interval: session.intervalDays,
    ease: Number(session.easeFactor),
    reps: session.repsCount,
  })

  const [updated] = await db.update(studySessions).set({
    endedAt,
    durationSeconds,
    focusScore: rating * 20,  // 0-5 → 0-100
    progressPercent: progressPercent || 100,
    intervalDays: sm2.interval,
    easeFactor: sm2.ease,
    repsCount: sm2.reps,
  }).where(eq(studySessions.id, sessionId)).returning()

  return { ...updated, nextReviewDate: addDays(endedAt, sm2.interval) }
}

function calculateSM2(q: number, prev: { interval: number; ease: number; reps: number }) {
  let { interval, ease, reps } = prev

  if (q >= 3) {
    if (reps === 0) interval = 1
    else if (reps === 1) interval = 6
    else interval = Math.round(interval * ease)
    reps += 1
  } else {
    reps = 0
    interval = 1
  }

  ease = ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  ease = Math.max(1.3, Math.round(ease * 100) / 100)

  return { interval, ease, reps }
}

function addDays(date: Date, days: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export async function getStats(userId: string) {
  // Total sessions and duration
  const [totals] = await db.select({
    totalSessions: sql<number>`count(*)`,
    totalSeconds: sql<number>`coalesce(sum(${studySessions.durationSeconds}), 0)`,
  }).from(studySessions).where(eq(studySessions.userId, userId))

  // Current streak (consecutive days with sessions)
  const streak = await calculateStreak(userId)

  // Due today: items whose interval has elapsed
  const dueSessions = await db.select({
    id: studySessions.id,
    knowledgeId: studySessions.knowledgeId,
    title: knowledgeItems.title,
    intervalDays: studySessions.intervalDays,
    easeFactor: studySessions.easeFactor,
    repsCount: studySessions.repsCount,
  }).from(studySessions)
    .innerJoin(knowledgeItems, eq(studySessions.knowledgeId, knowledgeItems.id))
    .where(and(
      eq(studySessions.userId, userId),
      sql`${studySessions.endedAt} is not null`,
      sql`(studySessions.started_at + (studySessions.interval_days || ' days')::interval) <= now()`
    ))
    .orderBy(studySessions.easeFactor)
    .limit(50)

  // Due in next 7 days
  const dueNext7 = await db.select({
    count: sql<number>`count(distinct ${studySessions.knowledgeId})`,
  }).from(studySessions)
    .where(and(
      eq(studySessions.userId, userId),
      sql`${studySessions.endedAt} is not null`,
      sql`(studySessions.started_at + (studySessions.interval_days || ' days')::interval) <= now() + interval '7 days'`
    ))

  return {
    overview: {
      totalHours: Math.round((totals.totalSeconds / 3600) * 10) / 10,
      totalSessions: Number(totals.totalSessions),
      currentStreak: streak,
      longestStreak: streak, // Simplified
      dueToday: dueSessions.length,
      dueNext7Days: Number(dueNext7[0]?.count || 0),
    },
    dueItems: dueSessions,
  }
}

async function calculateStreak(userId: string): Promise<number> {
  const rows = await db.select({
    date: sql<string>`date(${studySessions.startedAt})`,
  }).from(studySessions)
    .where(eq(studySessions.userId, userId))
    .groupBy(sql`date(${studySessions.startedAt})`)
    .orderBy(desc(sql`date(${studySessions.startedAt})`))

  if (rows.length === 0) return 0

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < rows.length; i++) {
    const expected = new Date(today)
    expected.setDate(expected.getDate() - i)
    const expectedStr = expected.toISOString().split('T')[0]
    
    if (rows[i].date === expectedStr) {
      streak++
    } else {
      break
    }
  }

  return streak
}

export async function getHeatmap(userId: string) {
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  const rows = await db.select({
    date: sql<string>`date(${studySessions.startedAt})`,
    count: sql<number>`count(*)`,
  }).from(studySessions)
    .where(and(
      eq(studySessions.userId, userId),
      gte(studySessions.startedAt, oneYearAgo)
    ))
    .groupBy(sql`date(${studySessions.startedAt})`)
    .orderBy(sql`date(${studySessions.startedAt})`)

  return rows.map((r: any) => ({
    date: r.date,
    count: Number(r.count),
    level: r.count >= 4 ? 3 : r.count >= 3 ? 2 : r.count >= 1 ? 1 : 0,
  }))
}

export async function getDueItems(userId: string) {
  return db.select({
    sessionId: studySessions.id,
    knowledgeId: studySessions.knowledgeId,
    title: knowledgeItems.title,
    intervalDays: studySessions.intervalDays,
    easeFactor: studySessions.easeFactor,
    repsCount: studySessions.repsCount,
  }).from(studySessions)
    .innerJoin(knowledgeItems, eq(studySessions.knowledgeId, knowledgeItems.id))
    .where(and(
      eq(studySessions.userId, userId),
      sql`${studySessions.endedAt} is not null`,
      sql`(studySessions.started_at + (studySessions.interval_days || ' days')::interval) <= now()`
    ))
    .orderBy(studySessions.easeFactor)
}

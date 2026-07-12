import { eq, and, desc, sql } from 'drizzle-orm'
import { db } from '@lms/db'
import { achievements, userAchievements, studySessions, knowledgeItems } from '@lms/db'
import { ErrorCode, AppError } from '@lms/shared'

export async function listAchievements(userId: string) {
  const allAchievements = await db.select().from(achievements).where(eq(achievements.isActive, true))
  const userUnlocked = await db.select().from(userAchievements).where(eq(userAchievements.userId, userId))
  
  const unlockedMap = new Map(userUnlocked.map(ua => [ua.achievementId, ua]))

  return allAchievements.map(a => {
    const userAch = unlockedMap.get(a.id)
    return {
      ...a,
      unlocked: !!userAch,
      unlockedAt: userAch?.unlockedAt || null,
      progress: calculateProgress(a, userAch?.progress as any),
      target: (a.condition as any).target || 1,
    }
  })
}

function calculateProgress(achievement: any, userProgress: any): number {
  if (!userProgress) return 0
  const target = (achievement.condition as any)?.target || 1
  const current = userProgress.current || 0
  return Math.min(Math.round((current / target) * 100), 100)
}

export async function checkAndUnlockAchievements(userId: string) {
  const newlyUnlocked: any[] = []
  
  // Gather user stats
  const [sessionCount] = await db.select({ count: sql<number>`count(*)` })
    .from(studySessions).where(eq(studySessions.userId, userId))
  
  const [knowledgeCount] = await db.select({ count: sql<number>`count(*)` })
    .from(knowledgeItems).where(eq(knowledgeItems.userId, userId))

  const stats = {
    sessionsCount: Number(sessionCount.count),
    knowledgeCount: Number(knowledgeCount.count),
    streak: await calculateStreak(userId),
    totalMinutes: await calculateTotalMinutes(userId),
  }

  // Check each achievement
  const allAchievements = await db.select().from(achievements).where(eq(achievements.isActive, true))
  const userUnlocked = await db.select({ achievementId: userAchievements.achievementId })
    .from(userAchievements).where(eq(userAchievements.userId, userId))
  const unlockedIds = new Set(userUnlocked.map(u => u.achievementId))

  for (const ach of allAchievements) {
    if (unlockedIds.has(ach.id)) continue
    
    const condition = ach.condition as any
    let current = 0
    
    switch (condition.metric) {
      case 'sessions_count':
        current = stats.sessionsCount
        break
      case 'knowledge_count':
        current = stats.knowledgeCount
        break
      case 'streak_days':
        current = stats.streak
        break
      case 'total_minutes':
        current = stats.totalMinutes
        break
    }

    if (current >= condition.target) {
      // Unlock!
      const [newAch] = await db.insert(userAchievements).values({
        userId,
        achievementId: ach.id,
        unlockedAt: new Date(),
        progress: { current, target: condition.target },
      }).returning()
      newlyUnlocked.push({ ...newAch, name: ach.name, description: ach.description, points: ach.points, icon: ach.icon })
    }
  }

  return newlyUnlocked
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

async function calculateTotalMinutes(userId: string): Promise<number> {
  const [result] = await db.select({
    total: sql<number>`coalesce(sum(${studySessions.durationSeconds}) / 60, 0)`,
  }).from(studySessions).where(eq(studySessions.userId, userId))
  return Math.round(Number(result.total))
}

export async function createAchievement(data: {
  name: string
  description?: string
  type: string
  condition: Record<string, unknown>
  points?: number
  icon?: string
}) {
  const [achievement] = await db.insert(achievements).values({
    ...data,
    condition: data.condition,
  }).returning()
  return achievement
}

export function seedDefaultAchievements() {
  return [
    { name: '初学者', description: '完成第一次学习', type: 'progress', condition: { metric: 'sessions_count', target: 1 }, points: 10, icon: '🌱' },
    { name: '坚持一周', description: '连续学习 7 天', type: 'streak', condition: { metric: 'streak_days', target: 7 }, points: 50, icon: '🔥' },
    { name: '知识收集者', description: '创建 10 个知识条目', type: 'knowledge', condition: { metric: 'knowledge_count', target: 10 }, points: 30, icon: '📚' },
    { name: '学习达人', description: '累计学习 5 小时', type: 'progress', condition: { metric: 'total_minutes', target: 300 }, points: 100, icon: '⭐' },
    { name: '学霸', description: '完成 50 次学习', type: 'progress', condition: { metric: 'sessions_count', target: 50 }, points: 200, icon: '🏆' },
  ]
}

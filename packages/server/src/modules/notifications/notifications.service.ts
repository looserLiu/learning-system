import { eq, and, sql, desc, gte } from 'drizzle-orm'
import { db } from '@lms/db'
import { notifications } from '@lms/db'
import logger from '../logger.js'

export async function createNotification(userId: string, data: {
  type: string
  title: string
  body?: string
  extraData?: Record<string, unknown>
}) {
  const [notification] = await db.insert(notifications).values({
    userId,
    type: data.type,
    title: data.title,
    body: data.body || null,
    data: data.extraData || {},
  }).returning()
  return notification
}

export async function listNotifications(userId: string, onlyUnread = false) {
  const conditions = [eq(notifications.userId, userId)]
  if (onlyUnread) {
    conditions.push(eq(notifications.isRead, false))
  }
  return db.select().from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt))
    .limit(50)
}

export async function markAsRead(notificationId: string, userId: string) {
  const [updated] = await db.update(notifications).set({ isRead: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
    .returning()
  return updated
}

export async function markAllAsRead(userId: string) {
  await db.update(notifications).set({ isRead: true })
    .where(eq(notifications.userId, userId))
  return { success: true }
}

export async function getUnreadCount(userId: string) {
  const [result] = await db.select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, false)
    ))
  return Number(result.count)
}

// 创建 "该复习了" 通知
export async function createDueReviewNotification(userId: string, dueCount: number) {
  return createNotification(userId, {
    type: 'due_review',
    title: `今天有 ${dueCount} 项内容需要复习`,
    body: '打开学习系统开始你的间隔重复之旅吧',
    extraData: { dueCount },
  })
}

// 创建系统通知
export async function createSystemNotification(userId: string, title: string, body?: string) {
  return createNotification(userId, {
    type: 'system',
    title,
    body,
  })
}

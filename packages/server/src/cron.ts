import cron from 'node-cron'
import { sql, eq, and } from 'drizzle-orm'
import { db } from '@lms/db'
import { studySessions } from '@lms/db'
import { emitToUser } from './sockets/index.js'
import * as notifService from './modules/notifications/notifications.service.js'
import logger from './logger.js'

// 每天上午 9:00 发送复习提醒
export function initCronJobs() {
  // 复习提醒 cron: 每天 9:00
  cron.schedule('0 9 * * *', async () => {
    logger.info({}, '执行每日复习提醒任务')
    try {
      await sendDueReviewReminders()
    } catch (err) {
      logger.error({ err }, '复习提醒任务失败')
    }
  })

  logger.info({ job: 'due_review_reminder', schedule: '0 9 * * *' }, '定时任务已注册')
}

async function sendDueReviewReminders() {
  // 查找所有有待复习内容的用户
  const users = await db.select({
    userId: studySessions.userId,
  }).from(studySessions)
    .where(sql`${studySessions.endedAt} IS NOT NULL`)
    .groupBy(studySessions.userId)

  for (const user of users) {
    // 检查该用户今日是否有到期的复习项
    const dueItems = await db.select({
      knowledgeId: studySessions.knowledgeId,
    }).from(studySessions)
      .where(and(
        eq(studySessions.userId, user.userId),
        sql`${studySessions.endedAt} IS NOT NULL`,
        sql`(study_sessions.started_at + (study_sessions.interval_days || ' days')::interval) <= now()`
      ))
      .groupBy(studySessions.knowledgeId)

    if (dueItems.length > 0) {
      // 创建数据库通知
      await notifService.createDueReviewNotification(user.userId, dueItems.length)

      // 实时推送（如果在线）
      emitToUser(user.userId, 'notification:new', {
        type: 'due_review',
        title: `你有 ${dueItems.length} 项内容需要复习`,
        dueCount: dueItems.length,
      })

      logger.info({ userId: user.userId, dueCount: dueItems.length }, '复习提醒已发送')
    }
  }
}

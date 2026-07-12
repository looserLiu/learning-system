import { eq, and, desc } from 'drizzle-orm'
import { db } from '@lms/db'
import { notes } from '@lms/db'
import { ErrorCode, AppError } from '@lms/shared'

export async function createNote(userId: string, knowledgeId: string, content: string, highlights: any[] = []) {
  const [note] = await db.insert(notes).values({
    userId,
    knowledgeId,
    content,
    highlights,
  }).returning()

  return note
}

export async function listNotes(userId: string, knowledgeId?: string) {
  const conditions: any[] = [eq(notes.userId, userId)]
  if (knowledgeId) conditions.push(eq(notes.knowledgeId, knowledgeId))

  return db.select().from(notes).where(and(...conditions)).orderBy(desc(notes.createdAt))
}

export async function updateNote(id: string, userId: string, input: { content?: string; highlights?: any[] }) {
  const [existing] = await db.select().from(notes).where(eq(notes.id, id))
  if (!existing) throw new AppError(ErrorCode.NOT_FOUND, '笔记不存在')
  if (existing.userId !== userId) throw new AppError(ErrorCode.FORBIDDEN, '无权修改此笔记')

  const [updated] = await db.update(notes).set({
    ...(input.content && { content: input.content }),
    ...(input.highlights && { highlights: input.highlights }),
    updatedAt: new Date(),
  }).where(eq(notes.id, id)).returning()

  return updated
}

export async function deleteNote(id: string, userId: string) {
  const [existing] = await db.select().from(notes).where(eq(notes.id, id))
  if (!existing) throw new AppError(ErrorCode.NOT_FOUND, '笔记不存在')
  if (existing.userId !== userId) throw new AppError(ErrorCode.FORBIDDEN, '无权删除此笔记')

  await db.delete(notes).where(eq(notes.id, id))
  return { success: true }
}

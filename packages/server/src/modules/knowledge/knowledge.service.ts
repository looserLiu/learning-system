import { eq, and, desc, sql } from 'drizzle-orm'
import { db } from '@lms/db'
import { knowledgeItems, tags, knowledgeTags } from '@lms/db'
import { ErrorCode, AppError } from '@lms/shared'

export interface CreateKnowledgeInput {
  title: string
  content: string
  type?: string
  category?: string
  difficulty?: string
  estimatedMinutes?: number
  metadata?: Record<string, unknown>
  tags?: string[]
}

export async function createKnowledge(userId: string, input: CreateKnowledgeInput) {
  const [item] = await db.insert(knowledgeItems).values({
    userId,
    title: input.title,
    content: input.content,
    type: input.type || 'article',
    category: input.category || null,
    difficulty: input.difficulty || 'beginner',
    estimatedMinutes: input.estimatedMinutes || null,
    metadata: input.metadata || {},
  }).returning()

  if (input.tags?.length) {
    for (const tagName of input.tags) {
      let [tag] = await db.select().from(tags).where(eq(tags.name, tagName))
      if (!tag) {
        [tag] = await db.insert(tags).values({ name: tagName }).returning()
      }
      await db.insert(knowledgeTags).values({
        knowledgeId: item.id,
        tagId: tag.id,
      }).onConflictDoNothing()
    }
  }

  return getKnowledgeById(item.id)
}

export async function listKnowledge(userId: string, query: {
  page: number
  limit: number
  category?: string
  tag?: string
  type?: string
  search?: string
  sort?: string
}) {
  const offset = (query.page - 1) * query.limit

  const conditions: any[] = [eq(knowledgeItems.userId, userId)]
  
  if (query.category) conditions.push(eq(knowledgeItems.category, query.category))
  if (query.type) conditions.push(eq(knowledgeItems.type, query.type))
  if (query.search) conditions.push(sql`${knowledgeItems.title} ILIKE ${'%' + query.search + '%'}`)

  const sortField = query.sort === 'oldest' ? knowledgeItems.createdAt : desc(knowledgeItems.updatedAt)

  const items = await db.select().from(knowledgeItems)
    .where(and(...conditions))
    .orderBy(sortField)
    .limit(query.limit)
    .offset(offset)

  const itemsWithTags = await Promise.all(items.map(async (item) => {
    const tagList = await db.select({ name: tags.name })
      .from(knowledgeTags)
      .innerJoin(tags, eq(knowledgeTags.tagId, tags.id))
      .where(eq(knowledgeTags.knowledgeId, item.id))
    return { ...item, tags: tagList.map((t: any) => t.name) }
  }))

  const [{ count: total }] = await db.select({ count: sql<number>`count(*)` })
    .from(knowledgeItems)
    .where(and(...conditions))

  return { items: itemsWithTags, page: query.page, limit: query.limit, total: Number(total) }
}

export async function getKnowledgeById(id: string) {
  const [item] = await db.select().from(knowledgeItems).where(eq(knowledgeItems.id, id))
  if (!item) throw new AppError(ErrorCode.NOT_FOUND, '知识条目不存在')

  const tagList = await db.select({ name: tags.name })
    .from(knowledgeTags)
    .innerJoin(tags, eq(knowledgeTags.tagId, tags.id))
    .where(eq(knowledgeTags.knowledgeId, item.id))

  return { ...item, tags: tagList.map((t: any) => t.name) }
}

export async function updateKnowledge(id: string, userId: string, input: Partial<CreateKnowledgeInput>) {
  const [existing] = await db.select().from(knowledgeItems).where(eq(knowledgeItems.id, id))
  if (!existing) throw new AppError(ErrorCode.NOT_FOUND, '知识条目不存在')
  if (existing.userId !== userId) throw new AppError(ErrorCode.FORBIDDEN, '无权修改此条目')

  const [updated] = await db.update(knowledgeItems).set({
    ...(input.title && { title: input.title }),
    ...(input.content && { content: input.content }),
    ...(input.type && { type: input.type }),
    ...(input.category !== undefined && { category: input.category }),
    ...(input.difficulty && { difficulty: input.difficulty }),
    ...(input.estimatedMinutes !== undefined && { estimatedMinutes: input.estimatedMinutes }),
    ...(input.metadata && { metadata: input.metadata }),
    updatedAt: new Date(),
  }).where(eq(knowledgeItems.id, id)).returning()

  return getKnowledgeById(updated.id)
}

export async function deleteKnowledge(id: string, userId: string) {
  const [existing] = await db.select().from(knowledgeItems).where(eq(knowledgeItems.id, id))
  if (!existing) throw new AppError(ErrorCode.NOT_FOUND, '知识条目不存在')
  if (existing.userId !== userId) throw new AppError(ErrorCode.FORBIDDEN, '无权删除此条目')

  await db.delete(knowledgeItems).where(eq(knowledgeItems.id, id))
  return { success: true }
}

export async function getAllTags() {
  return db.select().from(tags)
}

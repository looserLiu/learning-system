import { eq, and, desc, sql } from 'drizzle-orm'
import { db } from '@lms/db'
import { knowledgeItems, notes, tags, knowledgeTags } from '@lms/db'

export interface ExportRow {
  title: string
  content: string
  type: string
  category: string | null
  difficulty: string
  tags: string
  createdAt: string
}

export async function getExportData(userId: string, type: 'knowledge' | 'notes'): Promise<ExportRow[]> {
  if (type === 'knowledge') {
    const items = await db.select({
      id: knowledgeItems.id,
      title: knowledgeItems.title,
      content: knowledgeItems.content,
      type: knowledgeItems.type,
      category: knowledgeItems.category,
      difficulty: knowledgeItems.difficulty,
      createdAt: knowledgeItems.createdAt,
    }).from(knowledgeItems)
      .where(eq(knowledgeItems.userId, userId))
      .orderBy(desc(knowledgeItems.updatedAt))

    const result: ExportRow[] = []
    for (const item of items) {
      const tagList = await db.select({ name: tags.name })
        .from(knowledgeTags)
        .innerJoin(tags, eq(knowledgeTags.tagId, tags.id))
        .where(eq(knowledgeTags.knowledgeId, item.id))

      result.push({
        title: item.title,
        content: item.content,
        type: item.type,
        category: item.category,
        difficulty: item.difficulty,
        tags: tagList.map(t => t.name).join(', '),
        createdAt: new Date(item.createdAt).toLocaleDateString('zh-CN'),
      })
    }
    return result
  } else {
    const noteList = await db.select({
      title: knowledgeItems.title,
      content: notes.content,
      type: sql<'note'>`'note'`,
      category: knowledgeItems.category,
      difficulty: sql<'note'>`'note'`,
      createdAt: notes.createdAt,
    }).from(notes)
      .innerJoin(knowledgeItems, eq(notes.knowledgeId, knowledgeItems.id))
      .where(eq(notes.userId, userId))
      .orderBy(desc(notes.createdAt))

    return noteList.map(n => ({
      title: n.title,
      content: n.content,
      type: 'note',
      category: n.category,
      difficulty: '-',
      tags: '',
      createdAt: new Date(n.createdAt).toLocaleDateString('zh-CN'),
    }))
  }
}

export function formatAsCSV(data: ExportRow[]): string {
  const headers = ['标题', '内容', '类型', '分类', '难度', '标签', '创建时间']
  const rows = data.map(row => [
    `"${row.title.replace(/"/g, '""')}"`,
    `"${row.content.replace(/"/g, '""').slice(0, 500)}"`,
    row.type,
    row.category || '',
    row.difficulty,
    row.tags,
    row.createdAt,
  ])
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
}

export function formatAsText(data: ExportRow[]): string {
  return data.map((row, i) => {
    return [
      `--- ${i + 1}. ${row.title} ---`,
      `类型: ${row.type}  难度: ${row.difficulty}`,
      row.category ? `分类: ${row.category}` : '',
      row.tags ? `标签: ${row.tags}` : '',
      `创建时间: ${row.createdAt}`,
      '',
      row.content,
      '',
    ].filter(Boolean).join('\n')
  }).join('\n\n')
}

import { z } from 'zod'

export const KnowledgeCreateSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200),
  content: z.string().min(1, '内容不能为空'),
  type: z.enum(['article', 'video', 'code', 'podcast']).default('article'),
  category: z.string().max(50).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  estimatedMinutes: z.number().int().positive().optional(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).optional(),
})

export const KnowledgeUpdateSchema = KnowledgeCreateSchema.partial()

export const KnowledgeQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: z.string().optional(),
  tag: z.string().optional(),
  type: z.enum(['article', 'video', 'code', 'podcast']).optional(),
  search: z.string().optional(),
  sort: z.enum(['recent', 'popular', 'difficulty']).default('recent'),
})

export const NoteCreateSchema = z.object({
  content: z.string().min(1),
  highlights: z.array(z.object({
    start: z.number(),
    end: z.number(),
    text: z.string(),
  })).default([]),
})

export const NoteUpdateSchema = z.object({
  content: z.string().min(1).optional(),
  highlights: z.array(z.object({
    start: z.number(),
    end: z.number(),
    text: z.string(),
  })).optional(),
})

export type KnowledgeCreateInput = z.infer<typeof KnowledgeCreateSchema>
export type KnowledgeUpdateInput = z.infer<typeof KnowledgeUpdateSchema>
export type KnowledgeQuery = z.infer<typeof KnowledgeQuerySchema>
export type NoteCreateInput = z.infer<typeof NoteCreateSchema>
export type NoteUpdateInput = z.infer<typeof NoteUpdateSchema>

import { z } from 'zod'

export const StudySessionStartSchema = z.object({
  knowledgeId: z.string().uuid(),
  type: z.enum(['learn', 'review', 'practice']).default('learn'),
})

export const StudySessionEndSchema = z.object({
  sessionId: z.string().uuid(),
  rating: z.number().int().min(0).max(5),  // SM-2 quality
  progressPercent: z.number().min(0).max(100).optional(),
})

export const StudySessionPauseSchema = z.object({
  sessionId: z.string().uuid(),
  progressPercent: z.number().min(0).max(100),
})

export type StudySessionStartInput = z.infer<typeof StudySessionStartSchema>
export type StudySessionEndInput = z.infer<typeof StudySessionEndSchema>
export type StudySessionPauseInput = z.infer<typeof StudySessionPauseSchema>

import { z } from 'zod'

export const ExplainCodeSchema = z.object({
  code: z.string().min(1),
  language: z.string().optional(),
})

export const GenerateQuizSchema = z.object({
  knowledgeId: z.string().uuid(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
})

export const RecommendTopicSchema = z.object({})

export const AiChatSchema = z.object({
  message: z.string().min(1),
  knowledgeId: z.string().uuid().optional(),
  conversationId: z.string().uuid().optional(),
})

export type ExplainCodeInput = z.infer<typeof ExplainCodeSchema>
export type GenerateQuizInput = z.infer<typeof GenerateQuizSchema>
export type AiChatInput = z.infer<typeof AiChatSchema>

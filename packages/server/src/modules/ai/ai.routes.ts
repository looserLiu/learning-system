import { Router } from 'express'
import { authenticate } from '../../middleware/auth.ts'
import { validate } from '../../middleware/validate.ts'
import { ExplainCodeSchema, GenerateQuizSchema, AiChatSchema } from '@lms/shared'
import * as service from './ai.service.js'

const router = Router()

router.post('/explain', authenticate, validate(ExplainCodeSchema), async (req, res, next) => {
  try {
    const result = await service.explainCode(req.user!.userId, req.validated.code, req.validated.language)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

router.post('/quiz', authenticate, validate(GenerateQuizSchema), async (req, res, next) => {
  try {
    const result = await service.generateQuiz(req.user!.userId, req.validated.knowledgeId, req.validated.difficulty)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

router.post('/recommend', authenticate, async (req, res, next) => {
  try {
    const result = await service.recommendTopics(req.user!.userId)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

router.post('/chat', authenticate, validate(AiChatSchema), async (req, res, next) => {
  try {
    const result = await service.aiChat(req.user!.userId, req.validated.message, req.validated.knowledgeId, req.validated.conversationId)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

router.get('/health', authenticate, async (_req, res, next) => {
  try {
    const { getWorkingProvider } = await import('./providers/index.js')
    const provider = await getWorkingProvider()
    const info = provider.getModelInfo()
    res.json({ healthy: true, provider: info })
  } catch {
    res.json({ healthy: false, message: 'No AI provider available' })
  }
})

export default router

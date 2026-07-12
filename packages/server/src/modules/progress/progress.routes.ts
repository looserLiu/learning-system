import { Router } from 'express'
import { authenticate } from '../../middleware/auth.ts'
import { validate } from '../../middleware/validate.ts'
import { StudySessionStartSchema, StudySessionEndSchema } from '@lms/shared'
import * as service from './progress.service.js'

const router = Router()

router.post('/sessions', authenticate, validate(StudySessionStartSchema), async (req, res, next) => {
  try {
    const { knowledgeId, type } = req.validated
    const session = await service.startSession(req.user!.userId, knowledgeId, type)
    res.status(201).json(session)
  } catch (err) {
    next(err)
  }
})

router.put('/sessions/:id/end', authenticate, validate(StudySessionEndSchema), async (req, res, next) => {
  try {
    const { sessionId, rating, progressPercent } = req.validated
    const result = await service.endSession(req.user!.userId, sessionId, rating, progressPercent)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const stats = await service.getStats(req.user!.userId)
    res.json(stats)
  } catch (err) {
    next(err)
  }
})

router.get('/heatmap', authenticate, async (req, res, next) => {
  try {
    const heatmap = await service.getHeatmap(req.user!.userId)
    res.json(heatmap)
  } catch (err) {
    next(err)
  }
})

router.get('/due', authenticate, async (req, res, next) => {
  try {
    const items = await service.getDueItems(req.user!.userId)
    res.json(items)
  } catch (err) {
    next(err)
  }
})

export default router

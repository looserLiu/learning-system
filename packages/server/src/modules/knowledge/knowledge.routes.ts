import { Router } from 'express'
import { authenticate } from '../../middleware/auth.js'
import { validate, validateQuery } from '../../middleware/validate.js'
import { KnowledgeCreateSchema, KnowledgeQuerySchema } from '@lms/shared'
import * as service from './knowledge.service.js'

const router = Router()

router.get('/tags', authenticate, async (_req, res, next) => {
  try {
    const allTags = await service.getAllTags()
    res.json(allTags)
  } catch (err) {
    next(err)
  }
})

router.get('/', authenticate, validateQuery(KnowledgeQuerySchema), async (req, res, next) => {
  try {
    const result = await service.listKnowledge(req.user!.userId, req.validatedQuery)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const item = await service.getKnowledgeById(req.params.id)
    res.json(item)
  } catch (err) {
    next(err)
  }
})

router.post('/', authenticate, validate(KnowledgeCreateSchema), async (req, res, next) => {
  try {
    const item = await service.createKnowledge(req.user!.userId, req.validated)
    res.status(201).json(item)
  } catch (err) {
    next(err)
  }
})

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const item = await service.updateKnowledge(req.params.id, req.user!.userId, req.body)
    res.json(item)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const result = await service.deleteKnowledge(req.params.id, req.user!.userId)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

export default router

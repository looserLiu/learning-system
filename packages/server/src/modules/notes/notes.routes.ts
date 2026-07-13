import { Router } from 'express'
import { authenticate } from '../../middleware/auth.js'
import { validate } from '../../middleware/validate.js'
import { NoteCreateSchema, NoteUpdateSchema } from '@lms/shared'
import * as service from './notes.service.js'

const router = Router()

router.get('/', authenticate, async (req, res, next) => {
  try {
    const items = await service.listNotes(req.user!.userId, req.query.knowledgeId as string)
    res.json(items)
  } catch (err) {
    next(err)
  }
})

router.post('/', authenticate, validate(NoteCreateSchema), async (req, res, next) => {
  try {
    const { content, highlights } = req.validated
    const knowledgeId = req.query.knowledgeId as string
    const note = await service.createNote(req.user!.userId, knowledgeId, content, highlights)
    res.status(201).json(note)
  } catch (err) {
    next(err)
  }
})

router.put('/:id', authenticate, validate(NoteUpdateSchema), async (req, res, next) => {
  try {
    const note = await service.updateNote(req.params.id, req.user!.userId, req.validated)
    res.json(note)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const result = await service.deleteNote(req.params.id, req.user!.userId)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

export default router

import { Router } from 'express'
import { authenticate } from '../../middleware/auth.js'
import * as service from './achievements.service.js'

const router = Router()

router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await service.listAchievements(req.user!.userId)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

router.post('/check', authenticate, async (req, res, next) => {
  try {
    const unlocked = await service.checkAndUnlockAchievements(req.user!.userId)
    res.json({ unlocked })
  } catch (err) {
    next(err)
  }
})

export default router

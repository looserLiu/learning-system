import { Router } from 'express'
import { RegisterSchema, LoginSchema } from '@lms/shared'
import { validate } from '../../middleware/validate.js'
import { authenticate } from '../../middleware/auth.js'
import { createRateLimiter } from '../../middleware/rateLimit.js'
import * as service from './auth.service.js'

const router = Router()
const authLimiter = createRateLimiter(5, 60_000)

router.post('/register', authLimiter, validate(RegisterSchema), async (req, res, next) => {
  try {
    const result = await service.register(req.validated)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
})

router.post('/login', authLimiter, validate(LoginSchema), async (req, res, next) => {
  try {
    const result = await service.login(req.validated)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

router.post('/logout', authenticate, async (req, res, next) => {
  try {
    const result = await service.logout(req.user!.userId)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const profile = await service.getProfile(req.user!.userId)
    res.json(profile)
  } catch (err) {
    next(err)
  }
})

export default router

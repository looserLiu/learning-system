import { Router } from 'express'
import { authenticate } from '../../middleware/auth.js'
import * as service from './notifications.service.js'

const router = Router()

router.get('/', authenticate, async (req, res, next) => {
  try {
    const onlyUnread = req.query.unread === 'true'
    const items = await service.listNotifications(req.user!.userId, onlyUnread)
    res.json(items)
  } catch (err) {
    next(err)
  }
})

router.get('/unread-count', authenticate, async (req, res, next) => {
  try {
    const count = await service.getUnreadCount(req.user!.userId)
    res.json({ count })
  } catch (err) {
    next(err)
  }
})

router.put('/:id/read', authenticate, async (req, res, next) => {
  try {
    const result = await service.markAsRead(req.params.id, req.user!.userId)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

router.put('/read-all', authenticate, async (req, res, next) => {
  try {
    const result = await service.markAllAsRead(req.user!.userId)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

export default router

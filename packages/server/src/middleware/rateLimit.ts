import { Request, Response, NextFunction } from 'express'
import { AppError, ErrorCode } from '@lms/shared'

interface RateEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateEntry>()

export function createRateLimiter(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `rate:${req.ip}:${Math.floor(Date.now() / windowMs)}`
    const now = Date.now()
    
    const entry = store.get(key)
    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }

    entry.count++
    if (entry.count > maxRequests) {
      next(new AppError(ErrorCode.RATE_LIMITED, '请求过于频繁，请稍后再试'))
    } else {
      next()
    }
  }
}

export function clearRateLimitStore() {
  store.clear()
}

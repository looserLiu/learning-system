import { Request, Response, NextFunction } from 'express'
import { AppError, ErrorCode } from '@lms/shared'
import { verifyAccessToken, AccessTokenPayload } from '../utils/jwt.js'

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(ErrorCode.UNAUTHENTICATED, '请先登录')
    }

    const token = authHeader.slice(7)
    const payload = verifyAccessToken(token)
    req.user = payload
    next()
  } catch (err) {
    if (err instanceof AppError) return next(err)
    next(new AppError(ErrorCode.UNAUTHENTICATED, 'Token 无效或已过期'))
  }
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    try {
      req.user = verifyAccessToken(authHeader.slice(7))
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next()
}

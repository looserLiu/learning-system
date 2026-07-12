import { Request, Response, NextFunction } from 'express'
import { randomUUID } from 'crypto'
import logger from '../logger.ts'

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()
  const requestId = req.headers['x-request-id'] as string || randomUUID()

  res.on('finish', () => {
    const duration = Date.now() - start
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
      requestId,
    })
  })

  next()
}

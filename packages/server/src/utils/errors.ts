import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { AppError, ErrorCode } from '@lms/shared'
import logger from '../logger.ts'

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const requestId = req.headers['x-request-id'] as string

  if (err instanceof AppError) {
    const status = getStatusCode(err.code)
    logger.warn({ err: err.code, path: req.path, requestId }, err.message)
    return res.status(status).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        requestId,
      },
    })
  }

  if (err instanceof ZodError) {
    logger.warn({ path: req.path, requestId }, 'Validation error')
    return res.status(400).json({
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: '请求参数不合法',
        details: err.issues.map(i => ({
          field: i.path.join('.'),
          message: i.message,
        })),
        requestId,
      },
    })
  }

  logger.error({ err, path: req.path, requestId }, 'Internal error')
  return res.status(500).json({
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: '服务器内部错误',
      requestId,
    },
  })
}

function getStatusCode(code: string): number {
  const map: Record<string, number> = {
    [ErrorCode.VALIDATION_ERROR]: 400,
    [ErrorCode.BAD_REQUEST]: 400,
    [ErrorCode.UNAUTHENTICATED]: 401,
    [ErrorCode.TOKEN_EXPIRED]: 401,
    [ErrorCode.FORBIDDEN]: 403,
    [ErrorCode.NOT_FOUND]: 404,
    [ErrorCode.CONFLICT]: 409,
    [ErrorCode.EMAIL_EXISTS]: 409,
    [ErrorCode.UNPROCESSABLE]: 422,
    [ErrorCode.RATE_LIMITED]: 429,
    [ErrorCode.INTERNAL_ERROR]: 500,
    [ErrorCode.AI_PROVIDER_ERROR]: 502,
    [ErrorCode.AI_QUOTA_EXCEEDED]: 429,
  }
  return map[code] || 500
}

import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { AppError, ErrorCode } from '@lms/shared'

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.validated = schema.parse(req.body)
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        next(new AppError(
          ErrorCode.VALIDATION_ERROR,
          '请求参数不合法',
          err.issues.map(i => ({ field: i.path.join('.'), message: i.message })),
        ))
      } else {
        next(err)
      }
    }
  }
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.validatedQuery = schema.parse(req.query)
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        next(new AppError(
          ErrorCode.VALIDATION_ERROR,
          '查询参数不合法',
          err.issues.map(i => ({ field: i.path.join('.'), message: i.message })),
        ))
      } else {
        next(err)
      }
    }
  }
}

export const ErrorCode = {
  // 400
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',

  // 401
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // 403
  FORBIDDEN: 'FORBIDDEN',

  // 404
  NOT_FOUND: 'NOT_FOUND',

  // 409
  CONFLICT: 'CONFLICT',
  EMAIL_EXISTS: 'EMAIL_EXISTS',

  // 422
  UNPROCESSABLE: 'UNPROCESSABLE',

  // 429
  RATE_LIMITED: 'RATE_LIMITED',

  // 500
  INTERNAL_ERROR: 'INTERNAL_ERROR',

  // 502
  AI_PROVIDER_ERROR: 'AI_PROVIDER_ERROR',
  AI_QUOTA_EXCEEDED: 'AI_QUOTA_EXCEEDED',
} as const

export type ErrorCodeType = typeof ErrorCode[keyof typeof ErrorCode]

export const ErrorMessages: Record<ErrorCodeType, string> = {
  [ErrorCode.VALIDATION_ERROR]: '请求参数不合法',
  [ErrorCode.BAD_REQUEST]: '请求格式错误',
  [ErrorCode.UNAUTHENTICATED]: '请先登录',
  [ErrorCode.TOKEN_EXPIRED]: '登录已过期，请重新登录',
  [ErrorCode.FORBIDDEN]: '没有权限执行此操作',
  [ErrorCode.NOT_FOUND]: '资源不存在',
  [ErrorCode.CONFLICT]: '资源冲突',
  [ErrorCode.EMAIL_EXISTS]: '邮箱已被注册',
  [ErrorCode.UNPROCESSABLE]: '无法处理的请求',
  [ErrorCode.RATE_LIMITED]: '请求过于频繁，请稍后再试',
  [ErrorCode.INTERNAL_ERROR]: '服务器内部错误',
  [ErrorCode.AI_PROVIDER_ERROR]: 'AI 服务暂时不可用',
  [ErrorCode.AI_QUOTA_EXCEEDED]: 'AI 额度已用完，请明天再试',
}

export class AppError extends Error {
  constructor(
    public code: ErrorCodeType,
    message?: string,
    public details?: unknown,
  ) {
    super(message || ErrorMessages[code])
    this.name = 'AppError'
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    }
  }
}

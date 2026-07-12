import { eq } from 'drizzle-orm'
import { db } from '@lms/db'
import { users } from '@lms/db'
import { RegisterSchema, LoginSchema } from '@lms/shared'
import { ErrorCode, AppError } from '@lms/shared'
import { hashPassword, verifyPassword } from '../../utils/password.ts'
import { signAccessToken, signRefreshToken } from '../../utils/jwt.ts'

export interface AuthResult {
  user: { id: string; email: string; displayName: string | null; role: string }
  accessToken: string
}

export async function register(input: typeof RegisterSchema._type): Promise<AuthResult> {
  const [existing] = await db.select().from(users).where(eq(users.email, input.email))
  if (existing) {
    throw new AppError(ErrorCode.EMAIL_EXISTS, '邮箱已被注册')
  }

  const passwordHash = await hashPassword(input.password)
  const [user] = await db.insert(users).values({
    email: input.email,
    passwordHash,
    displayName: input.displayName,
  }).returning()

  const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role })
  const refreshToken = signRefreshToken({ userId: user.id })

  return {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    },
    accessToken,
  }
}

export async function login(input: typeof LoginSchema._type): Promise<AuthResult> {
  const [user] = await db.select().from(users).where(eq(users.email, input.email))
  if (!user) {
    throw new AppError(ErrorCode.UNAUTHENTICATED, '邮箱或密码错误')
  }

  const valid = await verifyPassword(input.password, user.passwordHash)
  if (!valid) {
    throw new AppError(ErrorCode.UNAUTHENTICATED, '邮箱或密码错误')
  }

  const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role })
  const refreshToken = signRefreshToken({ userId: user.id })

  return {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    },
    accessToken,
  }
}

export async function getProfile(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId))
  if (!user) {
    throw new AppError(ErrorCode.NOT_FOUND, '用户不存在')
  }

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    preferences: user.preferences,
    createdAt: user.createdAt,
  }
}

export async function logout(userId: string) {
  // In a full implementation, invalidate refresh token in blacklist
  return { success: true }
}

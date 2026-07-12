import { z } from 'zod'

export const RegisterSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(8, '密码至少8位'),
  displayName: z.string().min(1).max(50).optional(),
})

export const LoginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '请输入密码'),
})

export const RefreshSchema = z.object({
  refreshToken: z.string(),
})

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>

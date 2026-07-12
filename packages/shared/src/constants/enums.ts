export const UserRole = {
  LEARNER: 'learner',
  ADMIN: 'admin',
} as const
export type UserRoleType = typeof UserRole[keyof typeof UserRole]

export const KnowledgeType = {
  ARTICLE: 'article',
  VIDEO: 'video',
  CODE: 'code',
  PODCAST: 'podcast',
} as const
export type KnowledgeTypeType = typeof KnowledgeType[keyof typeof KnowledgeType]

export const Difficulty = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const
export type DifficultyType = typeof Difficulty[keyof typeof Difficulty]

export const StudySessionType = {
  LEARN: 'learn',
  REVIEW: 'review',
  PRACTICE: 'practice',
} as const
export type StudySessionTypeType = typeof StudySessionType[keyof typeof StudySessionType]

export const AchievementType = {
  PROGRESS: 'progress',
  KNOWLEDGE: 'knowledge',
  STREAK: 'streak',
  CUSTOM: 'custom',
} as const
export type AchievementTypeType = typeof AchievementType[keyof typeof AchievementType]

export const NotificationType = {
  ACHIEVEMENT: 'achievement',
  REMINDER: 'reminder',
  SYSTEM: 'system',
  DUE_REVIEW: 'due_review',
} as const
export type NotificationTypeType = typeof NotificationType[keyof typeof NotificationType]

export const AIProviderType = {
  OPENAI: 'openai',
  OLLAMA: 'ollama',
  DEEPSEEK: 'deepseek',
} as const
export type AIProviderTypeType = typeof AIProviderType[keyof typeof AIProviderType]

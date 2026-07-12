import 'dotenv/config'

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  
  databaseUrl: requireEnv('DATABASE_URL'),
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtAccessTtl: process.env.JWT_ACCESS_TTL || '15m',
  jwtRefreshTtl: process.env.JWT_REFRESH_TTL || '7d',
  
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  aiProvider: process.env.AI_PROVIDER || 'ollama',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b',
  aiDailyTokenLimit: parseInt(process.env.AI_DAILY_TOKEN_LIMIT || '100000', 10),
  
  logLevel: process.env.LOG_LEVEL || 'info',
  
  rateLimitGlobal: parseInt(process.env.RATE_LIMIT_GLOBAL || '100', 10),
  rateLimitAuth: parseInt(process.env.RATE_LIMIT_AUTH || '5', 10),
  rateLimitAi: parseInt(process.env.RATE_LIMIT_AI || '20', 10),
  
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  uploadMaxSizeMb: parseInt(process.env.UPLOAD_MAX_SIZE_MB || '5', 10),
}

export default config

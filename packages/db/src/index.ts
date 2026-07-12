import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import config from './config.ts'

const pool = new pg.Pool({
  connectionString: config.databaseUrl,
})

export const db = drizzle(pool)
export default db

export * from './schema/users.ts'
export * from './schema/knowledge.ts'
export * from './schema/progress.ts'
export * from './schema/achievements.ts'
export * from './schema/notes.ts'
export * from './schema/notifications.ts'
export * from './schema/ai.ts'

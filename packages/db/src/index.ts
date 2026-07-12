import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import config from './config.js'

const pool = new pg.Pool({
  connectionString: config.databaseUrl,
})

export const db = drizzle(pool)
export default db

export * from './schema/users.js'
export * from './schema/knowledge.js'
export * from './schema/progress.js'
export * from './schema/achievements.js'
export * from './schema/notes.js'
export * from './schema/notifications.js'
export * from './schema/ai.js'

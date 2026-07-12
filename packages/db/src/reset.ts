import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

const db = drizzle(pool)

async function main() {
  console.log('Resetting database...')
  await db.execute('DROP SCHEMA IF EXISTS public CASCADE' as any)
  await db.execute('CREATE SCHEMA public' as any)
  await db.execute('GRANT ALL ON SCHEMA public TO public' as any)
  console.log('Database reset. Run migrations next: pnpm db:migrate')
  await pool.end()
}

main().catch((err) => {
  console.error('Reset failed:', err)
  process.exit(1)
})

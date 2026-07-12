import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import bcrypt from 'bcryptjs'
import { users } from '../schema/users.js'
import { knowledgeItems, tags, knowledgeTags } from '../schema/knowledge.js'
import { studySessions } from '../schema/progress.js'
import { notes } from '../schema/notes.js'
import { eq, and } from 'drizzle-orm'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const db = drizzle(pool)

export async function seedDev() {
  console.log('Seeding development data...')

  // Clear existing data
  await db.delete(studySessions)
  await db.delete(knowledgeTags)
  await db.delete(notes)
  await db.delete(knowledgeItems)
  await db.delete(tags)
  await db.delete(users)

  // Create test user
  const passwordHash = await bcrypt.hash('password123', 12)
  const [user] = await db.insert(users).values({
    email: 'test@example.com',
    passwordHash,
    displayName: 'Test User',
    role: 'learner',
    preferences: { theme: 'light', dailyGoalMinutes: 60 },
  }).returning()
  console.log(`Created user: ${user.email} / password123`)

  // Create tags
  const tagList = [
    { name: 'JavaScript', color: '#F7DF1E' },
    { name: 'Python', color: '#3776AB' },
    { name: 'Design', color: '#E91E63' },
  ]
  const createdTags = await db.insert(tags).values(tagList).returning()
  console.log(`Created ${createdTags.length} tags`)

  // Create knowledge items
  const knowledgeData = [
    {
      title: 'JavaScript 闭包详解',
      content: '闭包是指能够访问其外部函数作用域中变量的函数...',
      type: 'code' as const,
      category: 'JavaScript',
      difficulty: 'intermediate' as const,
      estimatedMinutes: 15,
      tagNames: ['JavaScript'],
    },
    {
      title: 'Python 数据结构',
      content: 'Python 提供了多种内置数据结构包括列表、元组、字典和集合...',
      type: 'article' as const,
      category: 'Python',
      difficulty: 'beginner' as const,
      estimatedMinutes: 10,
      tagNames: ['Python'],
    },
    {
      title: '系统设计基础',
      content: '系统设计是面试中的重要环节...',
      type: 'video' as const,
      category: 'System Design',
      difficulty: 'advanced' as const,
      estimatedMinutes: 30,
      tagNames: ['Design'],
    },
    {
      title: 'React Hooks 最佳实践',
      content: 'Hooks 是 React 16.8 引入的新特性...',
      type: 'code' as const,
      category: 'React',
      difficulty: 'intermediate' as const,
      estimatedMinutes: 20,
      tagNames: ['JavaScript'],
    },
    {
      title: 'SQL 优化指南',
      content: '数据库性能优化是后端开发的核心技能...',
      type: 'article' as const,
      category: 'Database',
      difficulty: 'advanced' as const,
      estimatedMinutes: 25,
      tagNames: ['Python', 'Design'],
    },
  ]

  for (const item of knowledgeData) {
    const [created] = await db.insert(knowledgeItems).values({
      userId: user.id,
      title: item.title,
      content: item.content,
      type: item.type,
      category: item.category,
      difficulty: item.difficulty,
      estimatedMinutes: item.estimatedMinutes,
      isPublished: true,
    }).returning()

    // Associate tags
    for (const tagName of item.tagNames) {
      const tag = createdTags.find(t => t.name === tagName)
      if (tag) {
        await db.insert(knowledgeTags).values({
          knowledgeId: created.id,
          tagId: tag.id,
        })
      }
    }
  }
  console.log(`Created ${knowledgeData.length} knowledge items`)

  // Create 7 days of study sessions
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const sessionCount = Math.floor(Math.random() * 3) + 1

    for (let j = 0; j < sessionCount; j++) {
      const startHour = 9 + Math.floor(Math.random() * 10)
      date.setHours(startHour, Math.floor(Math.random() * 60))
      const durationMinutes = Math.floor(Math.random() * 45) + 15

      await db.insert(studySessions).values({
        userId: user.id,
        knowledgeId: (await db.select().from(knowledgeItems).limit(1))[0].id,
        type: 'learn' as const,
        startedAt: date,
        endedAt: new Date(date.getTime() + durationMinutes * 60000),
        durationSeconds: durationMinutes * 60,
        focusScore: Math.floor(Math.random() * 30) + 70,
        progressPercent: 100,
        intervalDays: Math.floor(Math.random() * 7),
        easeFactor: 2.5,
        repsCount: Math.floor(Math.random() * 5),
      })
    }
  }
  console.log('Created 7 days of study sessions')

  // Create sample notes
  const [firstItem] = await db.select().from(knowledgeItems).limit(1)
  await db.insert(notes).values({
    userId: user.id,
    knowledgeId: firstItem.id,
    content: '闭包的本质是函数可以携带它的词法环境...',
    highlights: [{ start: 10, end: 20, text: '词法环境' }],
  })
  console.log('Created sample notes')

  console.log('\nSeed completed! Login: test@example.com / password123')
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDev()
    .then(() => pool.end())
    .catch((err) => {
      console.error(err)
      pool.end()
      process.exit(1)
    })
}

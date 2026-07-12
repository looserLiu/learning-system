import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { authRoutes } from './modules/auth/index.ts'
import { knowledgeRoutes } from './modules/knowledge/index.ts'
import { progressRoutes } from './modules/progress/index.ts'
import { notesRoutes } from './modules/notes/index.ts'
import { aiRoutes } from './modules/ai/index.ts'
import { achievementsRoutes } from './modules/achievements/index.ts'
import { errorHandler } from './utils/errors.ts'
import { requestLogger } from './middleware/requestLogger.ts'
import config from './config.ts'

export function createApp() {
  const app = express()

  // Security & parsing
  app.use(helmet())
  app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
  }))
  app.use(express.json({ limit: '10mb' }))

  // Logger
  app.use(requestLogger)

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // Routes
  app.use('/api/auth', authRoutes)
  app.use('/api/knowledge', knowledgeRoutes)
  app.use('/api/progress', progressRoutes)
  app.use('/api/notes', notesRoutes)
  app.use('/api/ai', aiRoutes)
  app.use('/api/achievements', achievementsRoutes)

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: '路由不存在',
      },
    })
  })

  // Error handler
  app.use(errorHandler)

  return app
}

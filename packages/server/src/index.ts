import { createApp } from './app.js'
import { initSocketIO } from './sockets/index.js'
import { initCronJobs } from './cron.js'
import logger from './logger.js'
import config from './config.js'

const app = createApp()
const server = app.listen(config.port, () => {
  logger.info({
    port: config.port,
    env: config.env,
    databaseUrl: config.databaseUrl.replace(/\/\/.*@/, '//***@'),
  }, 'Server started')
})

// 初始化 Socket.IO
initSocketIO(server)

// 初始化定时任务
initCronJobs()

// Graceful shutdown
const shutdown = (signal: string) => {
  logger.info({ signal }, 'Shutting down...')
  server.close(() => {
    logger.info('Server closed')
    process.exit(0)
  })

  // Force shutdown after 10s
  setTimeout(() => {
    logger.error('Forced shutdown')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

process.on('unhandledRejection', (err) => {
  logger.error({ err }, 'Unhandled rejection')
})

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught exception')
  process.exit(1)
})

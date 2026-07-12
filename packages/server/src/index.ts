import { createApp } from './app'
import logger from './logger'
import config from './config'

const app = createApp()

const server = app.listen(config.port, () => {
  logger.info({
    port: config.port,
    env: config.env,
    databaseUrl: config.databaseUrl.replace(/\/\/.*@/, '//***@'),  // hide credentials
  }, 'Server started')
})

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

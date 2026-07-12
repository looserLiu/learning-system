import pino from 'pino'
import config from './config.js'

// 适配浅色背景的 ANSI 配色
const C: Record<string, string> = {
  gray: '\x1b[90m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
}

const LEVEL_COLORS: Record<string, string> = {
  DEBUG: C.gray,
  INFO: C.blue,
  WARN: C.yellow,
  ERROR: C.red,
  FATAL: C.magenta,
}

const isDev = config.env === 'development'

function formatLine(args: {
  level: string
  time: number
  msg: string
  err?: Error
  [k: string]: unknown
}): string {
  const color = LEVEL_COLORS[args.level] || ''
  const reset = C.reset
  const time = new Date(args.time).toLocaleTimeString('zh-CN', { hour12: false })
  const level = args.level.padEnd(5)
  let line = `${color}[${time}] ${level}${reset} ${args.msg}`
  if (args.err) {
    line += `\n${color}  ↳ ${args.err.message}${reset}`
    if (args.err.stack) {
      line += `\n${C.gray}${args.err.stack.split('\n').slice(1, 4).join('\n')}${reset}`
    }
  }
  return line
}

const logger = pino(
  {
    level: config.logLevel || 'info',
    base: { service: 'lms-server' },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  // dev: 直接输出到 stdout（不使用 pino-pretty 的 worker thread）
  isDev
    ? pino.destination({
        dest: 1,
        sync: true,
        mkdir: false,
    })
    : pino.destination({ dest: 1, sync: true, mkdir: false }),
)

// 覆盖输出格式（简单 wrap）
const origLog = logger.info.bind(logger)
const origWarn = logger.warn.bind(logger)
const origError = logger.error.bind(logger)
const origDebug = logger.debug.bind(logger)

// 创建带中文格式输出的 child logger
export const clog = {
  info(msg: string, extra?: Record<string, unknown>) {
    origLog(extra || {}, msg)
  },
  warn(msg: string, extra?: Record<string, unknown>) {
    origWarn(extra || {}, msg)
  },
  error(msg: string, err?: Error) {
    origError(err || {}, msg)
  },
  debug(msg: string, extra?: Record<string, unknown>) {
    origDebug(extra || {}, msg)
  },
  child(bindings: Record<string, unknown>) {
    return logger.child(bindings)
  },
}

export { logger }
export default clog

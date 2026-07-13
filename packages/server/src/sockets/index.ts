import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import { verifyAccessToken } from '../utils/jwt.js'
import logger from '../logger.js'

let io: Server | null = null

// 在线用户 socket 映射 (userId -> Set<socketId>)
const userSockets = new Map<string, Set<string>>()

export function initSocketIO(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // 生产环境应限制为前端域名
      methods: ['GET', 'POST'],
    },
  })

  // JWT 认证中间件
  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string
    if (!token) {
      return next(new Error('未授权'))
    }
    try {
      const payload = verifyAccessToken(token)
      socket.data.userId = payload.userId
      socket.data.email = payload.email
      next()
    } catch {
      next(new Error('Token 无效'))
    }
  })

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId as string
    logger.info({ userId, socketId: socket.id }, '用户连接 Socket.IO')

    // 记录用户 socket
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set())
    }
    userSockets.get(userId)!.add(socket.id)

    // 加入用户专属房间
    socket.join(`user:${userId}`)

    // 进度同步：客户端上报进度
    socket.on('progress:update', (data: { sessionId: string; progress: number }) => {
      // 广播给该用户的其他设备
      socket.to(`user:${userId}`).emit('progress:sync', {
        sessionId: data.sessionId,
        progress: data.progress,
        timestamp: Date.now(),
      })
    })

    // 断开连接
    socket.on('disconnect', () => {
      userSockets.get(userId)?.delete(socket.id)
      if (userSockets.get(userId)?.size === 0) {
        userSockets.delete(userId)
      }
      logger.info({ userId, socketId: socket.id }, '用户断开 Socket.IO')
    })
  })

  logger.info('Socket.IO 初始化完成')
  return io
}

// 向特定用户发送事件
export function emitToUser(userId: string, event: string, data: unknown) {
  if (!io) return
  io.to(`user:${userId}`).emit(event, data)
}

// 向全广播
export function broadcast(event: string, data: unknown) {
  if (!io) return
  io.emit(event, data)
}

// 获取在线状态
export function isUserOnline(userId: string): boolean {
  return userSockets.has(userId) && userSockets.get(userId)!.size > 0
}

export function getIO() {
  return io
}

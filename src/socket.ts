import { Server as IOServer } from 'socket.io';
import http from 'http';
import { verifyAccessToken } from './utils/jwt';

let io: IOServer;

export function initSocket(server: http.Server) {
  io = new IOServer(server, { cors: { origin: '*' } });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string;
    const payload = token && verifyAccessToken(token);
    if (!payload) return next(new Error('Auth error'));
    socket.data.user = payload;
    next();
  });

  io.on('connection', (socket) => {
    const userId = socket.data.user.id;
    socket.join(`user:${userId}`);
    socket.emit('connected', { userId });
  });
}

export function getIo() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

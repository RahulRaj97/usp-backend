import { Server as IOServer } from 'socket.io';
import http from 'http';
import { verifyAccessToken } from './utils/jwt';

let io: IOServer;

export function initSocket(server: http.Server) {
  try {
    io = new IOServer(server, { 
      cors: { origin: '*' },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token as string;
        if (!token) {
          console.warn('Socket connection attempt without token');
          return next(new Error('No token provided'));
        }
        
        const payload = verifyAccessToken(token);
        if (!payload) {
          console.warn('Socket connection attempt with invalid token');
          return next(new Error('Invalid token'));
        }
        
        socket.data.user = payload;
        next();
      } catch (error) {
        console.error('Socket authentication error:', (error as Error).message);
        next(new Error('Authentication failed'));
      }
    });

    io.on('connection', (socket) => {
      try {
        const userId = socket.data.user.id;
        socket.join(`user:${userId}`);
        socket.emit('connected', { userId });
        console.log(`Socket connected for user: ${userId}`);
      } catch (error) {
        console.error('Socket connection error:', (error as Error).message);
        socket.disconnect(true);
      }
    });

    io.on('error', (error) => {
      console.error('Socket.IO error:', error);
    });

  } catch (error) {
    console.error('Failed to initialize Socket.IO:', (error as Error).message);
    throw error;
  }
}

export function getIo() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

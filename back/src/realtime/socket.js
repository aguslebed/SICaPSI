import { Server } from 'socket.io';
import { JwtTokenService } from '../services/JwtTokenService.js';

let ioInstance = null;

function parseCookies(cookieHeader = '') {
  const out = {};
  cookieHeader.split(';').forEach(pair => {
    const idx = pair.indexOf('=');
    if (idx > -1) {
      const key = pair.slice(0, idx).trim();
      const val = decodeURIComponent(pair.slice(idx + 1).trim());
      if (key) out[key] = val;
    }
  });
  return out;
}

export function initRealtime(server) {
  if (ioInstance) return ioInstance;

  const allowedOrigin = process.env.FRONT_ORIGIN || 'http://localhost:5173';

  // Resolve JWT secret similar to routes
  const resolvedSecret = (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32)
    ? process.env.JWT_SECRET
    : (process.env.NODE_ENV === 'production' ? null : 'dev_secret_please_override_0123456789abcdef');
  const tokenService = new JwtTokenService({ secret: resolvedSecret });

  const io = new Server(server, {
    cors: {
      origin: allowedOrigin,
      credentials: true
    }
  });

  // Authentication using either auth token or cookie token
  io.use((socket, next) => {
    try {
      // Prefer token sent via auth payload
      const authToken = socket.handshake?.auth?.token;
      const cookieToken = parseCookies(socket.request.headers.cookie || '').token;
      const token = authToken || cookieToken;
      if (!token) return next(new Error('No autorizado'));
      const decoded = tokenService.verify(token);
      if (!decoded?.userId) return next(new Error('Token inválido'));
      socket.user = { userId: decoded.userId, email: decoded.email, role: decoded.role };
      return next();
    } catch (e) {
      return next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    const uid = socket.user?.userId;
    if (uid) {
      socket.join(`user:${uid}`);
    }
    const role = socket.user?.role;
    if (role) {
      socket.join(`role:${role}`);
    }

    socket.on('disconnect', () => {
      // Cleanup handled by socket.io
    });
  });

  ioInstance = io;
  return ioInstance;
}

export function getIO() {
  if (!ioInstance) throw new Error('Socket.IO not initialized');
  return ioInstance;
}

export function emitToUser(userId, event, payload) {
  if (!ioInstance) return;
  ioInstance.to(`user:${userId}`).emit(event, payload);
}

export function emitToRole(role, event, payload) {
  if (!ioInstance || !role) return;
  ioInstance.to(`role:${role}`).emit(event, payload);
}

import AppError from '../middlewares/AppError.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { buildUploadPath } from '../utils/uploadsHelper.js';

export function makeMessageController({ messageService, messageFormatter }) {
  return {
    async send(req, res, next) {
      try {
        const senderId = req.user?.userId;
        if (!senderId) throw new AppError('No autorizado', 401);
        const { to, subject, body, attachments, recipientId, trainingId } = req.body || {};
        if (!subject || !body || (!to && !recipientId)) throw new AppError('Campos requeridos: to o recipientId, subject, body', 400);
        if (!trainingId) throw new AppError('trainingId requerido', 400);
        const created = await messageService.send({ senderId, recipientEmail: to, recipientId, subject, message: body, attachments, trainingId });
        const formatted = messageFormatter.format(created);
        // Emitir evento realtime a remitente y destinatario
        try {
          const io = req.app?.get('io');
          const recipientUserId = formatted?.recipient?._id?.toString?.() || formatted?.recipient;
          if (io) {
            if (recipientUserId) io.to(`user:${recipientUserId}`).emit('user:data:refresh', { reason: 'message:received', trainingId });
            if (senderId) io.to(`user:${senderId}`).emit('user:data:refresh', { reason: 'message:sent', trainingId });
          }
        } catch (e) { /* no romper respuesta por errores de socket */ }
        res.status(201).json(formatted);
      } catch (err) { next(err); }
    },

    async setRead(req, res, next) {
      try {
        const userId = req.user?.userId;
        if (!userId) throw new AppError('No autorizado', 401);
        const { id } = req.params;
        const { isRead } = req.body || {};
        const updated = await messageService.setRead({ messageId: id, userId, isRead: !!isRead });
        const formatted = messageFormatter.format(updated);
        try {
          const io = req.app?.get('io');
          if (io) io.to(`user:${userId}`).emit('user:data:refresh', { reason: 'message:read', messageId: id });
        } catch {}
        res.json(formatted);
      } catch (err) { next(err); }
    },

    async moveToTrash(req, res, next) {
      try {
        const userId = req.user?.userId;
        if (!userId) throw new AppError('No autorizado', 401);
        const { id } = req.params;
        const updated = await messageService.moveToTrash({ messageId: id, userId });
        const formatted = messageFormatter.format(updated);
        try {
          const io = req.app?.get('io');
          if (io) io.to(`user:${userId}`).emit('user:data:refresh', { reason: 'message:trash', messageId: id });
        } catch {}
        res.json(formatted);
      } catch (err) { next(err); }
    },

    async restore(req, res, next) {
      try {
        const userId = req.user?.userId;
        if (!userId) throw new AppError('No autorizado', 401);
        const { id } = req.params;
        const updated = await messageService.restore({ messageId: id, userId });
        const formatted = messageFormatter.format(updated);
        try {
          const io = req.app?.get('io');
          if (io) io.to(`user:${userId}`).emit('user:data:refresh', { reason: 'message:restore', messageId: id });
        } catch {}
        res.json(formatted);
      } catch (err) { next(err); }
    },

    async deletePermanent(req, res, next) {
      try {
        const userId = req.user?.userId;
        if (!userId) throw new AppError('No autorizado', 401);
        const { id } = req.params;
        const result = await messageService.deletePermanent({ messageId: id, userId });
        try {
          const io = req.app?.get('io');
          if (io) io.to(`user:${userId}`).emit('user:data:refresh', { reason: 'message:delete', messageId: id });
        } catch {}
        res.json(result);
      } catch (err) { next(err); }
    },

    async uploadAttachments(req, res, next) {
      try {
        const userId = req.user?.userId;
        if (!userId) throw new AppError('No autorizado', 401);
        const files = req.files || [];
        const payload = files.map(f => ({
          filename: f.filename,
          originalName: f.originalname,
          url: buildUploadPath(f.filename),
          size: f.size
        }));
        res.status(201).json({ attachments: payload });
      } catch (err) { next(err); }
    }
    ,

    async downloadAttachment(req, res, next) {
      try {
        const userId = req.user?.userId;
        if (!userId) throw new AppError('No autorizado', 401);
        const { id, index } = req.params;
        const msg = await messageService.getMessageById(id);
        if (!msg) throw new AppError('Mensaje no encontrado', 404);
        
        // Autorización: el usuario debe ser el remitente O el destinatario del mensaje
        const senderId = msg.sender?._id?.toString() || msg.sender?.toString();
        const recipientId = msg.recipient?._id?.toString() || msg.recipient?.toString();
        const userIdStr = userId.toString();
        const isAuthorized = (senderId === userIdStr) || (recipientId === userIdStr);
        
        if (!isAuthorized) throw new AppError('No autorizado para descargar este adjunto', 403);
        
        const i = parseInt(index, 10);
        if (Number.isNaN(i) || i < 0 || i >= (msg.attachments?.length || 0)) throw new AppError('Adjunto no encontrado', 404);
  const att = msg.attachments[i];
  // Adjunto puede ser objeto { filename, url, originalName } o un string URL legado
  const candidate = (att && typeof att === 'object') ? (att.filename || att.url) : att;
  if (!candidate) throw new AppError('Adjunto inválido', 400);

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads');
  const safeName = path.basename(candidate); // evita path traversal
  const filePath = path.join(uploadsDir, safeName);

        if (!fs.existsSync(filePath)) throw new AppError('Archivo no existe', 404);
  const downloadName = (att && att.originalName) || (att && att.filename) || safeName;
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadName)}"`);
        // Simple content-type guess by extension
        const ext = path.extname(safeName).toLowerCase();
        const mimeTypes = {
          '.pdf': 'application/pdf',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
          '.doc': 'application/msword',
          '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          '.xls': 'application/vnd.ms-excel',
          '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          '.txt': 'text/plain',
          '.zip': 'application/zip'
        };
        res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
        const stream = fs.createReadStream(filePath);
        stream.on('error', (e) => next(e));
        stream.pipe(res);
      } catch (err) { next(err); }
    }
  };
}

export default makeMessageController;
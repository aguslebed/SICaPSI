import AppError from '../middlewares/AppError.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

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
        res.status(201).json(messageFormatter.format(created));
      } catch (err) { next(err); }
    },

    async setRead(req, res, next) {
      try {
        const userId = req.user?.userId;
        if (!userId) throw new AppError('No autorizado', 401);
        const { id } = req.params;
        const { isRead } = req.body || {};
        const updated = await messageService.setRead({ messageId: id, userId, isRead: !!isRead });
        res.json(messageFormatter.format(updated));
      } catch (err) { next(err); }
    },

    async moveToTrash(req, res, next) {
      try {
        const userId = req.user?.userId;
        if (!userId) throw new AppError('No autorizado', 401);
        const { id } = req.params;
        const updated = await messageService.moveToTrash({ messageId: id, userId });
        res.json(messageFormatter.format(updated));
      } catch (err) { next(err); }
    },

    async restore(req, res, next) {
      try {
        const userId = req.user?.userId;
        if (!userId) throw new AppError('No autorizado', 401);
        const { id } = req.params;
        const updated = await messageService.restore({ messageId: id, userId });
        res.json(messageFormatter.format(updated));
      } catch (err) { next(err); }
    },

    async deletePermanent(req, res, next) {
      try {
        const userId = req.user?.userId;
        if (!userId) throw new AppError('No autorizado', 401);
        const { id } = req.params;
        const result = await messageService.deletePermanent({ messageId: id, userId });
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
          url: `/uploads/${f.filename}`,
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
        // Autorización: remitente o destinatario pueden descargar
        const isOwner = [msg.sender?.toString(), msg.recipient?.toString()].includes(userId.toString());
        if (!isOwner) throw new AppError('No autorizado', 403);
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
        res.setHeader('Content-Type', 'application/octet-stream');
        const stream = fs.createReadStream(filePath);
        stream.on('error', (e) => next(e));
        stream.pipe(res);
      } catch (err) { next(err); }
    }
  };
}

export default makeMessageController;
import { Router } from "express";
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import makeAuthMiddleware from "../middlewares/authMiddleware.js";
import { JwtTokenService } from "../services/JwtTokenService.js";

// Models
import User from "../models/User.js";
import PrivateMessage from "../models/PrivateMessage.js";
import Training from "../models/Training.js";

// Services
import MessageService from "../services/MessageService.js";

// Formatters
import MessageResponseFormatter from "../formatters/MessageResponseFormatter.js";

// Controller
import { makeMessageController } from "../controllers/messageController.js";

const resolvedSecret = (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32)
  ? process.env.JWT_SECRET
  : (process.env.NODE_ENV === 'production' ? null : 'dev_secret_please_override_0123456789abcdef');
const jwtTokenService = new JwtTokenService({ secret: resolvedSecret });
const authMiddleware = makeAuthMiddleware({ tokenService: jwtTokenService });

const messageService = new MessageService({ PrivateMessageModel: PrivateMessage, UserModel: User, TrainingModel: Training });
const messageFormatter = new MessageResponseFormatter();
const controller = makeMessageController({ messageService, messageFormatter });

const router = Router();

// Multer storage for message attachments
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(__dirname, "..", "..", "uploads"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '_');
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${base}-${unique}${ext}`);
  }
});
const upload = multer({ storage });

// Enviar un mensaje
router.post('/', authMiddleware, controller.send);

// Marcar como leído/no leído
router.patch('/:id/read', authMiddleware, controller.setRead);

// Mover a papelera
router.post('/:id/trash', authMiddleware, controller.moveToTrash);

// Restaurar desde papelera
router.post('/:id/restore', authMiddleware, controller.restore);

// Borrado permanente (solo desde papelera)
router.delete('/:id', authMiddleware, controller.deletePermanent);

// Subida de adjuntos para mensajes
router.post('/attachments', authMiddleware, upload.array('files', 10), controller.uploadAttachments);

// Descargar un adjunto específico por índice
router.get('/:id/attachments/:index/download', authMiddleware, controller.downloadAttachment);

export default router;
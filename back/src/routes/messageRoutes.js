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

// Filtro de archivos: solo imágenes, PDFs y documentos comunes
const fileFilter = function (req, file, cb) {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Solo se permiten imágenes (JPG, PNG, GIF, WebP), PDF, documentos de Office y archivos ZIP.`), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB máximo por archivo
  }
});

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

// Subida de adjuntos para mensajes (con manejo de errores de multer)
router.post('/attachments', authMiddleware, (req, res, next) => {
  upload.array('files', 10)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'Archivo demasiado grande. El tamaño máximo permitido es de 10 MB por archivo.' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ message: 'Demasiados archivos. Máximo 10 archivos por mensaje.' });
        }
        return res.status(400).json({ message: `Error al subir archivo: ${err.message}` });
      }
      // Error del fileFilter
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, controller.uploadAttachments);

// Descargar un adjunto específico por índice
router.get('/:id/attachments/:index/download', authMiddleware, controller.downloadAttachment);

export default router;
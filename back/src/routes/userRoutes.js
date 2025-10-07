import { Router } from "express";
import { makeUserController } from "../controllers/userController.js";
import { RegistrationValidator } from "../validators/RegistrationValidator.js";
import makeAuthMiddleware from "../middlewares/authMiddleware.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';

// Modelos
import User from "../models/User.js";
import Training from "../models/Training.js";
import Level from "../models/Level.js";
import PrivateMessage from "../models/PrivateMessage.js";

// Servicios
import UserService from "../services/UserService.js";
import TrainingService from "../services/TrainingService.js";
import MessageService from "../services/MessageService.js";
import { JwtTokenService } from "../services/JwtTokenService.js";

// Formatters
import UserResponseFormatter from "../formatters/UserResponseFormatter.js";
import TrainingResponseFormatter from "../formatters/TrainingResponseFormatter.js";
import MessageResponseFormatter from "../formatters/MessageResponseFormatter.js";
 

const resolvedSecret = (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32)
    ? process.env.JWT_SECRET
    : (process.env.NODE_ENV === 'production' ? null : 'dev_secret_please_override_0123456789abcdef');
const jwtTokenService = new JwtTokenService({ secret: resolvedSecret });
const authMiddleware = makeAuthMiddleware({ tokenService: jwtTokenService });

const userController = makeUserController({ 
    userService: new UserService({ UserModel: User, TrainingModel: Training }), 
    trainingService: new TrainingService({ UserModel: User, LevelModel: Level, TrainingModel: Training }), 
    messageService: new MessageService({ PrivateMessageModel: PrivateMessage, UserModel: User, TrainingModel: Training }), 
    userFormatter: new UserResponseFormatter(), 
    trainingFormatter: new TrainingResponseFormatter(), 
    messageFormatter : new MessageResponseFormatter(), 
 });

// Multer storage for profile images
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

// CAMBIO: Middleware agregado para verificar permisos de administrador
// Respeta SRP: Solo verifica permisos administrativos
// Permite reutilización en múltiples rutas que requieren permisos de admin
const adminMiddleware = (req, res, next) => {
  if (!req.user || !['Administrator', 'Manager'].includes(req.user.role)) {
    return res.status(403).json({ 
      message: 'Acceso denegado. Se requieren permisos de administrador.' 
    });
  }
  next();
};

const router = Router();
router.post("/register", RegistrationValidator, userController.create);
router.get("/", authMiddleware, userController.list);
router.get("/recipients", authMiddleware, userController.listRecipients);
router.get("/connect/me", authMiddleware, userController.getUserCompleteData);
router.get("/:id", authMiddleware, userController.getById);
router.patch("/:id", authMiddleware, userController.update); 
router.post("/:id/profile-image", authMiddleware, upload.single('image'), userController.uploadProfileImage); 
router.post("/change-password", authMiddleware, userController.changePassword);

// CAMBIO: Rutas agregadas para funcionalidad administrativa de profesores
// Respeta RESTful API design y mantiene consistencia con rutas existentes
// Todas requieren autenticación y permisos de administrador
router.get("/admin/teachers", authMiddleware, adminMiddleware, userController.listTeachers);
router.get("/admin/teachers/:id", authMiddleware, adminMiddleware, userController.getTeacherById);
router.patch("/admin/teachers/:id/status", authMiddleware, adminMiddleware, userController.updateTeacherStatus);

// Gestion de Usuario
router.delete("/:id", authMiddleware, adminMiddleware, userController.deleteUser);

export default router;
  
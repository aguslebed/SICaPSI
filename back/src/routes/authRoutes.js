import dotenv from "dotenv";
dotenv.config();
import { Router } from "express";
import { AuthServiceBcrypt } from "../services/AuthServiceBcrypt.js";
import { LoginValidator } from "../validators/LoginValidator.js";
import { makeAuthController } from "../controllers/authController.js";
import { createAuditMiddleware } from "../middlewares/auditMiddleware.js";

const router = Router();
import makeAuthMiddleware from '../middlewares/authMiddleware.js';
import { JwtTokenService } from "../services/JwtTokenService.js";

// Resolve secret with development fallback (prevents crash if .env loads later)
const resolvedSecret = (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32)
  ? process.env.JWT_SECRET
  : (process.env.NODE_ENV === 'production' ? null : 'dev_secret_please_override_0123456789abcdef');
const jwtTokenService = new JwtTokenService({ secret: resolvedSecret });
const authMiddleware = makeAuthMiddleware({ tokenService: jwtTokenService });

const controller = makeAuthController({
  authService: new AuthServiceBcrypt(),
  loginValidator: new LoginValidator(),
  tokenService: jwtTokenService
});

// Importar middleware de auditoría para autenticación
import { auditLogin, auditAuth } from "../middlewares/auditMiddleware.js";

router.post("/login", auditLogin(), controller.login);
router.post("/logout", authMiddleware, auditAuth('LOGOUT'), controller.logout);
router.get("/check-auth", authMiddleware, controller.checkAuth);

// Token para autenticación de Socket.IO (dev-friendly, evita depender de cookies SameSite)
router.get("/socket-token", authMiddleware, (req, res) => {
  try {
    const user = req.user;
    const token = jwtTokenService.sign({
      userId: user.userId,
      email: user.email,
      role: user.role || 'user',
      kind: 'socket'
    }, { expiresIn: '2h' });
    res.json({ token });
  } catch (e) {
    res.status(500).json({ message: 'No se pudo emitir socket-token' });
  }
});

export default router;
import dotenv from "dotenv";
dotenv.config();
import { Router } from "express";
import { AuthServiceBcrypt } from "../services/AuthServiceBcrypt.js";
import { LoginValidator } from "../validators/LoginValidator.js";
import { makeAuthController } from "../controllers/authController.js";

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

router.post("/login", controller.login);
router.post("/logout", controller.logout);
router.get("/check-auth", authMiddleware, controller.checkAuth);

export default router;
import { Router } from "express";
import { AuthServiceBcrypt } from "../services/AuthServiceBcrypt.js";
import { LoginValidator } from "../validators/LoginValidator.js";
import { makeAuthController } from "../controllers/authController.js";

const router = Router();
import makeAuthMiddleware from '../middlewares/authMiddleware.js';
import { JwtTokenService } from "../services/JwtTokenService.js";

const jwtTokenService = new JwtTokenService({ secret: process.env.JWT_SECRET });
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
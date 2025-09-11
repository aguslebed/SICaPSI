import { Router } from "express";
import { AuthServiceBcrypt } from "../services/AuthServiceBcrypt.js";
import { LoginValidator } from "../validators/LoginValidator.js";
import { makeAuthController } from "../controllers/authController.js";

const router = Router();
import authMiddleware from '../middlewares/authMiddleware.js';

const controller = makeAuthController({
  authService: new AuthServiceBcrypt(),
  loginValidator: new LoginValidator(),
});

router.post("/login", controller.login);
router.post("/logout", controller.logout);
router.get("/check-auth", authMiddleware, controller.checkAuth);

export default router; 
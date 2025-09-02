import { Router } from "express";
import { AuthServiceBcrypt } from "../services/AuthServiceBcrypt.js";
import { LoginValidator } from "../validators/LoginValidator.js";
import { JsonResponseFormatter } from "../formatters/JsonResponseFormatter.js";
import { makeAuthController } from "../controllers/authController.js";

const router = Router();

const controller = makeAuthController({
  authService: new AuthServiceBcrypt(),
  loginValidator: new LoginValidator(),
  responseFormatter: new JsonResponseFormatter()
});

router.post("/login", controller.login);

export default router;

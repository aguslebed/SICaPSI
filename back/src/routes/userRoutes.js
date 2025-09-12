import { Router } from "express";
import { makeUserController } from "../controllers/userController.js";
import { RegistrationValidator } from "../validators/RegistrationValidator.js";
import authMiddleware from "../middlewares/authMiddleware.js";

// Instancia el controlador principal (puedes pasarle los servicios si lo necesitas)
const userController = makeUserController();

const router = Router();
router.post("/register", RegistrationValidator, userController.create);
router.get("/", authMiddleware, userController.list);
router.get("/connect/me", authMiddleware, userController.getUserCompleteData);
router.get("/:id", authMiddleware, userController.getById);
router.patch("/:id", authMiddleware, userController.update);

export default router;
  
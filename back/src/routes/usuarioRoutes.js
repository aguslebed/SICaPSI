/**
 * Rutas de Usuario
 * Endpoints REST: /api/v1/usuarios
 * C-[ADD]-(CLASS:USUARIO): define rutas base
 */
import { Router } from "express";
import {
  C_Usuario_Alta,
  C_Usuario_Listar,
  C_Usuario_ObtenerPorId,
  C_Usuario_Actualizar
} from "../controllers/usuarioController.js";
import { RegistrationValidator } from "../validators/RegistrationValidator.js";
import authMiddleware from "../middlewares/authMiddleware.js"

const router = Router();

//Rutas publicas
router.post("/registro", RegistrationValidator, C_Usuario_Alta);

// Rutas privadas
router.get("/", authMiddleware, C_Usuario_Listar);
router.get("/:usuarioId", authMiddleware, C_Usuario_ObtenerPorId);
router.patch("/:usuarioId", authMiddleware, C_Usuario_Actualizar);

export default router;

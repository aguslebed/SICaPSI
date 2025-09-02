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

const router = Router();

// NADA de auth acá. Solo usuario.
router.get("/", C_Usuario_Listar);
router.get("/:usuarioId", C_Usuario_ObtenerPorId);
router.post("/registro", RegistrationValidator, C_Usuario_Alta);
router.patch("/:usuarioId", C_Usuario_Actualizar);

export default router;

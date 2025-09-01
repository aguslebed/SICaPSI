import { Router } from "express";
import { login } from "../controllers/usuarioController.js";
import { registrarseUsuario } from "../controllers/usuarioNEW.js";

/**
 * Configurador de rutas de usuario
 * Responsabilidades:
 * 1. Definir rutas de autenticación
 * 2. Mapear rutas a controladores
 * 3. Configurar middlewares por ruta
 * 
 * Cumple SRP: Solo define rutas de usuario
 * Cumple OCP: Extensible para nuevas rutas sin modificar existentes
 */

const router = Router();

/**
 * Configura todas las rutas de usuario
 * @returns {Router} Router configurado
 */
export function configureUserRoutes() {
  // Responsabilidad 1: Ruta de autenticación
  router.post("/login", login);

  // Responsabilidad 2: Ruta de registro
  router.post("/registrarse", registrarseUsuario);

  // Responsabilidad 3: Futuras rutas pueden agregarse aquí
  // router.post("/logout", logout);
  // router.get("/profile", getProfile);

  return router;
}

// Export default para compatibilidad
export default configureUserRoutes();

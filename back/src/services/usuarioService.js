import { BcryptAuthService } from "./BcryptAuthService.js";

/**
 * Servicio de usuario - Wrapper para compatibilidad
 * Responsabilidades:
 * 1. Mantener compatibilidad con código existente
 * 2. Delegar a servicios especializados
 * 3. Proveer interface legacy
 * 
 * Cumple SRP: Solo actúa como adaptador/wrapper
 * Cumple OCP: Usa servicios extensibles internamente
 */

// Instancia del servicio de autenticación
const authService = new BcryptAuthService();

/**
 * Función legacy de login - mantiene compatibilidad
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<Object|null>} Usuario autenticado o null
 * @deprecated Usar BcryptAuthService directamente en nuevos códigos
 */
export const loginUsuario = async (email, password) => {
  // Delega al servicio especializado
  return await authService.authenticate(email, password);
};
import { IResponseFormatter } from "../interfaces/IResponseFormatter.js";

/**
 * Formateador de respuestas para usuarios
 * Responsabilidades:
 * 1. Formatear respuestas de login exitoso
 * 2. Formatear respuestas de error
 * 3. Seleccionar campos apropiados del usuario
 * 
 * Cumple SRP: Solo formatea respuestas de usuario
 * Cumple OCP: Implementa interface extensible
 */
export class UserResponseFormatter extends IResponseFormatter {
  /**
   * Formatea respuesta de login exitoso
   * @param {Object} user - Usuario autenticado
   * @returns {Object} Respuesta formateada
   */
  formatSuccess(user) {
    return {
      success: true,
      message: "Login exitoso",
      user: {
        id: user._id,
        email: user.mail,
        nombre: user.nombre_completo,
        tipo: user.tipo,
        legajo: user.legajo
      }
    };
  }

  /**
   * Formatea respuesta de error
   * @param {Object} error - Error a formatear
   * @returns {Object} Error formateado
   */
  formatError(error) {
    return {
      success: false,
      message: error.message || "Error en la operación",
      error: error.code || "UNKNOWN_ERROR"
    };
  }

  /**
   * Formatea respuesta de credenciales inválidas
   * @returns {Object} Respuesta de error formateada
   */
  formatInvalidCredentials() {
    return {
      success: false,
      message: "Credenciales inválidas"
    };
  }
}

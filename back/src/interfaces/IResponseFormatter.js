/**
 * Interface para formateadores de respuesta
 * Permite diferentes formatos de respuesta extensibles
 * Cumple OCP: Nuevos formatos sin modificar existentes
 */
export class IResponseFormatter {
  /**
   * Formatea respuesta de éxito
   * @param {Object} data - Datos a formatear
   * @returns {Object} Respuesta formateada
   */
  formatSuccess(data) {
    throw new Error("Method 'formatSuccess' must be implemented");
  }

  /**
   * Formatea respuesta de error
   * @param {Object} error - Error a formatear
   * @returns {Object} Error formateado
   */
  formatError(error) {
    throw new Error("Method 'formatError' must be implemented");
  }
}

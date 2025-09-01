/**
 * Interface para validadores de datos
 * Permite diferentes tipos de validación extensibles
 * Cumple OCP: Nuevos validadores sin modificar existentes
 */
export class IValidator {
  /**
   * Valida datos de entrada
   * @param {Object} data - Datos a validar
   * @returns {Object} Resultado de validación {isValid: boolean, errors: Array}
   */
  validate(data) {
    throw new Error("Method 'validate' must be implemented");
  }
}

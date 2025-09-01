import { IValidator } from "../interfaces/IValidator.js";

/**
 * Validador para datos de login
 * Responsabilidades:
 * 1. Validar formato de email
 * 2. Validar que password no esté vacío
 * 3. Retornar resultado de validación
 * 
 * Cumple SRP: Solo valida datos de login
 * Cumple OCP: Implementa interface extensible
 */
export class LoginValidator extends IValidator {
  /**
   * Valida datos de login
   * @param {Object} data - {email, password}
   * @returns {Object} {isValid: boolean, errors: Array}
   */
  validate(data) {
    const errors = [];

    // Responsabilidad 1: Validar email
    if (!data.email || !this._isValidEmail(data.email)) {
      errors.push("Email inválido");
    }

    // Responsabilidad 2: Validar password
    if (!data.password || data.password.trim().length === 0) {
      errors.push("Password requerido");
    }

    // Responsabilidad 3: Retornar resultado
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida formato de email usando regex
   * @private
   */
  _isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

import { IValidator } from "../interfaces/IValidator.js";

/**
 * Validador para datos de registro
 * Responsabilidades:
 * 1. Validar campos requeridos
 * 2. Validar formatos de datos
 * 3. Validar reglas de negocio
 * 
 * Cumple SRP: Solo valida datos de registro
 * Cumple OCP: Extensible para nuevas validaciones
 */
export class RegistrationValidator extends IValidator {
  /**
   * Valida datos de registro
   * @param {Object} data - Datos a validar
   * @returns {Object} {isValid: boolean, errors: Array}
   */
  validate(data) {
    const errors = [];

    // Responsabilidad 1: Validar campos requeridos
    this._validateRequiredFields(data, errors);

    // Responsabilidad 2: Validar formatos
    this._validateFormats(data, errors);

    // Responsabilidad 3: Validar reglas de negocio
    this._validateBusinessRules(data, errors);

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  _validateRequiredFields(data, errors) {
    const required = ['email', 'password', 'nombre_completo'];
    
    required.forEach(field => {
      if (!data[field] || data[field].trim().length === 0) {
        errors.push(`${field} es requerido`);
      }
    });
  }

  _validateFormats(data, errors) {
    // Email format
    if (data.email && !this._isValidEmail(data.email)) {
      errors.push("Formato de email inválido");
    }

    // Password strength
    if (data.password && data.password.length < 6) {
      errors.push("Password debe tener al menos 6 caracteres");
    }
  }

  _validateBusinessRules(data, errors) {
    // Tipo de usuario válido
    const validTypes = ['admin', 'empleado', 'supervisor'];
    if (data.tipo && !validTypes.includes(data.tipo)) {
      errors.push("Tipo de usuario inválido");
    }
  }

  _isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

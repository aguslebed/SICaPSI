import { IValidator } from "../interfaces/IValidator.js";

// CONST: regex de email (fuera de la clase para claridad y test)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * V-[VAL]-(CLASS:AUTH): LoginValidator
 * SRP: valida formato de credenciales (sin tocar BD)
 */
export class LoginValidator extends IValidator {
  /**
   * Valida datos de login
   * @param {Object} data - { email, password }
   * @returns {{isValid: boolean, errors: Array<{field:string,message:string}>}}
   */
  validate(data = {}) {
    const errors = [];

    // Normalización segura
    const email = String(data.email ?? "").trim().toLowerCase();
    const password = String(data.password ?? "");

    // 1) Email
    if (!email || !EMAIL_REGEX.test(email)) {
      errors.push({ field: "email", message: "Email inválido" });
    }

    // 2) Password
    if (!password.trim()) {
      errors.push({ field: "password", message: "Password requerido" });
    }

    // 3) Resultado
    return { isValid: errors.length === 0, errors };
  }
}

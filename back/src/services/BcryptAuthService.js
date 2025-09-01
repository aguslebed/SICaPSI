import { IAuthService } from "../interfaces/IAuthService.js";
import Usuario from "../models/Usuario.js";
import bcrypt from "bcrypt";

/**
 * Implementación de autenticación usando bcrypt
 * Responsabilidades:
 * 1. Buscar usuario por email
 * 2. Validar contraseña con bcrypt
 * 3. Retornar resultado de autenticación
 * 
 * Cumple SRP: Solo maneja autenticación bcrypt
 * Cumple OCP: Implementa interface extensible
 */
export class BcryptAuthService extends IAuthService {
  /**
   * Autentica usuario usando bcrypt
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña en texto plano
   * @returns {Promise<Object|null>} Usuario si autenticación exitosa, null si falla
   */
  async authenticate(email, password) {
    try {
      // Responsabilidad 1: Buscar usuario
      const usuario = await Usuario.findOne({ mail: email });
      if (!usuario) return null;

      // Responsabilidad 2: Validar contraseña
      const esValida = await bcrypt.compare(password, usuario.contrasena);
      if (!esValida) return null;

      // Responsabilidad 3: Retornar usuario autenticado
      return usuario;
    } catch (error) {
      console.error("Error en autenticación bcrypt:", error);
      return null;
    }
  }
}

/**
 * Interface para servicios de autenticación
 * Permite diferentes estrategias de autenticación (bcrypt, JWT, OAuth)
 * Cumple OCP: Extensible sin modificar código existente
 */
export class IAuthService {
  /**
   * Autentica un usuario con email y contraseña
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<Object|null>} Usuario autenticado o null
   */
  async authenticate(email, password) {
    throw new Error("Method 'authenticate' must be implemented");
  }
}

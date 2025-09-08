import bcrypt from "bcryptjs";
import Usuario from "../models/Usuario.js";
import { IAuthService } from "../interfaces/IAuthService.js";

export class AuthServiceBcrypt extends IAuthService {
  /**
   * Autentica un usuario con email y contraseña usando bcrypt
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object|null>} Usuario autenticado o null
   */
  async authenticate(email, password) {
    const usuario = await Usuario.findOne({ email: email });
    console.log("Usuario encontrado:", usuario);
    if (!usuario) return null;
    const match = await bcrypt.compare(password, usuario.password);
    return match ? usuario : null;
  }
}
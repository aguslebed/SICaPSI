import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { IAuthService } from "../interfaces/IAuthService.js";

export class AuthServiceBcrypt extends IAuthService {
  /**
   * Autentica un usuario con email y contraseña usando bcrypt
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object|null>} Usuario autenticado o null
   */
  async authenticate(email, password) {
  const user = await User.findOne({ email: email });
  if (!user) return null;
  const match = await bcrypt.compare(password, user.password);
  return match ? user : null;
  }
}
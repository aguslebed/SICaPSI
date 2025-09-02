// services/AuthServiceBcrypt.js
import { IAuthService } from "../interfaces/IAuthService.js";
import Usuario from "../models/Usuario.js";
import bcrypt from "bcryptjs";

/**
 * AuthServiceBcrypt
 * Responsabilidades:
 * 1) Buscar usuario por mail
 * 2) Validar contraseña con bcrypt (compare)
 * 3) Retornar usuario o null (si credenciales inválidas)
 *
 * SRP: Sí.  OCP: Sí (implementa IAuthService).
 */
export class AuthServiceBcrypt extends IAuthService {
  async authenticate(email, password) {
    // 1) Buscar usuario por mail (tu campo en BD es 'mail')
    const usuario = await Usuario.findOne({ mail: email });
    if (!usuario) return null;

    // 2) Comparar hash
    const ok = await bcrypt.compare(password, usuario.contrasena);
    if (!ok) return null;

    // 3) OK
    return usuario;
  }
}

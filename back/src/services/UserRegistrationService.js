import Usuario from "../models/Usuario.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

/**
 * Servicio de registro de usuarios
 * Responsabilidades:
 * 1. Validar que el usuario no exista
 * 2. Crear hash seguro de contraseña
 * 3. Guardar nuevo usuario en BD
 * 
 * Cumple SRP: Solo maneja registro de usuarios
 * Cumple OCP: Extensible para diferentes tipos de usuarios
 */
export class UserRegistrationService {
  /**
   * Crea un nuevo usuario en el sistema
   * @param {Object} userData - Datos del usuario a crear
   * @returns {Promise<Object|null>} Usuario creado o null si ya existe
   */
  async createUser(userData) {
    try {
      // Responsabilidad 1: Verificar que no exista
      const existingUser = await Usuario.findOne({ 
        $or: [
          { mail: userData.email },
          { dni: userData.dni },
          { legajo: userData.legajo }
        ]
      });

      if (existingUser) {
        return null; // Usuario ya existe
      }

      // Responsabilidad 2: Hash seguro de contraseña
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Responsabilidad 3: Crear y guardar usuario
      const usuario = new Usuario({
        _id: new mongoose.Types.ObjectId(),
        mail: userData.email,
        contrasena: hashedPassword,
        nombre_completo: userData.nombre_completo,
        tipo: userData.tipo || 'empleado',
        legajo: userData.legajo,
        ultimo_ingreso: new Date()
      });

      const usuarioGuardado = await usuario.save();
      return usuarioGuardado;

    } catch (error) {
      console.error("Error en registro de usuario:", error);
      throw error;
    }
  }
}

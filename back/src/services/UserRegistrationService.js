import Usuario from "../models/Usuario.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

/**
 * Servicio de registro de usuarios
 * Responsabilidades:
 * 1. Validar que el usuario no exista
 * 2. Crear hash seguro de contraseña
 * 3. Guardar nuevo usuario en BD
 */
export class UserRegistrationService {
  /**
   * Crea un nuevo usuario en el sistema
   * @param {Object} userData - Datos del usuario a crear
   * @returns {Promise<Object|null>} Usuario creado o null si ya existe
   */
  async createUser(userData) {
    try {
      // Verificar que no exista por email, numeroDocumento o legajo
      const existingUser = await Usuario.findOne({
        $or: [
          { email: userData.email },
          { numeroDocumento: userData.numeroDocumento },
          { legajo: userData.legajo }
        ]
      });

      if (existingUser) {
        return null; // Usuario ya existe
      }

      // Hash seguro de contraseña
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Crear y guardar usuario con todos los campos requeridos
      const usuario = new Usuario({
        _id: new mongoose.Types.ObjectId(),
        nombre: userData.nombre,
        apellidos: userData.apellidos,
        tipoDocumento: userData.tipoDocumento,
        numeroDocumento: userData.numeroDocumento,
        fechaNacimiento: userData.fechaNacimiento,
        email: userData.email,
        codigoPostal: userData.codigoPostal,
        direccion: userData.direccion,
        numeroDireccion: userData.numeroDireccion,
        departamento: userData.departamento,
        provincia: userData.provincia,
        localidad: userData.localidad,
        codArea: userData.codArea,
        telefono: userData.telefono,
        password: hashedPassword,
        tipo: userData.tipo || "alumno",
        legajo: userData.legajo || "",
        ultimoIngreso: new Date()
      });

      const usuarioGuardado = await usuario.save();
      return usuarioGuardado;

    } catch (error) {
      console.error("Error en registro de usuario:", error);
      throw error;
    }
  }
}

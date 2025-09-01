
import { UserRegistrationService } from "../services/UserRegistrationService.js";
import { RegistrationValidator } from "../validators/RegistrationValidator.js";
import { UserResponseFormatter } from "../formatters/UserResponseFormatter.js";

/**
 * Controlador de registro de usuarios
 * Responsabilidades:
 * 1. Coordinar validación de datos de registro
 * 2. Coordinar proceso de creación de usuario
 * 3. Coordinar formateo de respuesta
 * 
 * Cumple SRP: Solo coordina el flujo de registro
 * Cumple OCP: Usa servicios extensibles
 */

// Dependencias inyectadas
const registrationService = new UserRegistrationService();
const validator = new RegistrationValidator();
const formatter = new UserResponseFormatter();

/**
 * Maneja petición de registro de usuario
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 */
export const registrarseUsuario = async (req, res) => {
  try {
    // Responsabilidad 1: Coordinar validación
    const validationResult = validator.validate(req.body);
    if (!validationResult.isValid) {
      return res.status(400).json(formatter.formatError({
        message: validationResult.errors.join(", "),
        code: "VALIDATION_ERROR"
      }));
    }

    // Responsabilidad 2: Coordinar creación de usuario
    const usuarioCreado = await registrationService.createUser(req.body);
    
    if (!usuarioCreado) {
      return res.status(400).json(formatter.formatError({
        message: "El usuario ya existe",
        code: "USER_EXISTS"
      }));
    }

    // Responsabilidad 3: Coordinar respuesta exitosa
    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      user: {
        id: usuarioCreado._id,
        email: usuarioCreado.mail,
        nombre: usuarioCreado.nombre_completo,
        tipo: usuarioCreado.tipo,
        legajo: usuarioCreado.legajo
      }
    });

  } catch (error) {
    console.error("Error en registro controller:", error);
    res.status(500).json(formatter.formatError({
      message: "Error del servidor",
      code: "SERVER_ERROR"
    }));
  }
};
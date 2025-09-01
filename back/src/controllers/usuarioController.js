
import { BcryptAuthService } from "../services/BcryptAuthService.js";
import { LoginValidator } from "../validators/LoginValidator.js";
import { UserResponseFormatter } from "../formatters/UserResponseFormatter.js";

/**
 * Controlador de usuario - Coordina el proceso de login
 * Responsabilidades:
 * 1. Coordinar validación de datos
 * 2. Coordinar autenticación
 * 3. Coordinar formateo de respuesta
 * 
 * Cumple SRP: Solo coordina el flujo de login (orquestación)
 * Cumple OCP: Usa interfaces, extensible con nuevos servicios
 */

// Dependencias inyectadas (extensibles)
const authService = new BcryptAuthService();
const validator = new LoginValidator();
const formatter = new UserResponseFormatter();

/**
 * Maneja petición de login
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 */
export const login = async (req, res) => {
  try {
    // Responsabilidad 1: Coordinar validación
    const validationResult = validator.validate(req.body);
    if (!validationResult.isValid) {
      return res.status(400).json(formatter.formatError({
        message: validationResult.errors.join(", "),
        code: "VALIDATION_ERROR"
      }));
    }

    const { email, password } = req.body;

    // Responsabilidad 2: Coordinar autenticación
    const user = await authService.authenticate(email, password);
    if (!user) {
      return res.status(401).json(formatter.formatInvalidCredentials());
    }

    // Responsabilidad 3: Coordinar respuesta exitosa
    res.json(formatter.formatSuccess(user));

  } catch (error) {
    console.error("Error en login controller:", error);
    res.status(500).json(formatter.formatError({
      message: "Error del servidor",
      code: "SERVER_ERROR"
    }));
  }
};

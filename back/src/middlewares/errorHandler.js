/**
 * Middleware de manejo de errores
 * Responsabilidades:
 * 1. Capturar errores no manejados
 * 2. Formatear respuestas de error
 * 3. Logging de errores para debugging
 * 
 * Cumple SRP: Solo maneja errores HTTP
 * Cumple OCP: Extensible para diferentes tipos de errores
 */

/**
 * Maneja errores no capturados en la aplicación
 * @param {Error} err - Error capturado
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Función next de Express
 */
export const errorHandler = (err, req, res, next) => {
  // Responsabilidad 1: Logging para debugging
  console.error(`Error en ${req.method} ${req.path}:`, err?.stack || err);

  // Responsabilidad 2: Determinar tipo de error
  let statusCode = 500;
  let message = "Error interno del servidor";

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = "Error de validación";
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = "No autorizado";
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = "ID inválido";
  }

  // Responsabilidad 3: Formatear y enviar respuesta
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

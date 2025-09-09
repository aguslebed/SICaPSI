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
  console.error(`Error en ${req.method} ${req.path}:`, err?.stack || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Error interno del servidor";
  const details = err.details || null;

  res.status(statusCode).json({
    success: false,
    code: statusCode,
    message,
    details
  });
  
};
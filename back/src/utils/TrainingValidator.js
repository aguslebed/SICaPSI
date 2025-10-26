/**
 * TrainingValidator - Funciones puras para validación de capacitaciones
 * Cumple con SRP: Solo responsable de validación de lógica de negocio
 */

/**
 * Verifica si un título ya existe
 * @param {Object|null} existingTraining - Capacitación existente encontrada
 * @returns {boolean} true si existe
 */
export function titleExists(existingTraining) {
  return !!existingTraining;
}

/**
 * Verifica si un valor es un ObjectId válido de Mongoose
 * @param {any} value - Valor a verificar
 * @returns {boolean} true si es un ObjectId válido
 */
export function isValidObjectId(value) {
  // Validación básica de formato ObjectId (24 caracteres hexadecimales)
  return typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value);
}

/**
 * Crea mensaje de error para título duplicado
 * @returns {string} Mensaje de error
 */
export function createDuplicateTitleError() {
  return "El título de la capacitación ya existe";
}

/**
 * Crea mensaje de error para título duplicado en actualización
 * @returns {string} Mensaje de error
 */
export function createDuplicateTitleOnUpdateError() {
  return "Ya existe otra capacitación con ese título";
}

/**
 * Crea mensaje de error para capacitación no encontrada
 * @returns {string} Mensaje de error
 */
export function createTrainingNotFoundError() {
  return "Capacitación no encontrada";
}

/**
 * Crea mensaje de error para obtener capacitador
 * @returns {string} Mensaje de error
 */
export function createGetTrainerError() {
  return "Error al obtener el capacitador de la capacitación";
}

/**
 * Determina la estrategia de búsqueda de usuario (por ID o email)
 * @param {string} assignedValue - Valor de assignedTeacher
 * @returns {Object} { searchById: boolean, searchByEmail: boolean, value: string }
 */
export function determineUserSearchStrategy(assignedValue) {
  const searchById = isValidObjectId(assignedValue);
  return {
    searchById,
    searchByEmail: !searchById || true, // Siempre intentar email como fallback
    value: assignedValue
  };
}

/**
 * Extrae campos para actualizar un training
 * @param {Object} training - Training existente
 * @param {Object} trainingData - Nuevos datos
 * @returns {Object} Training actualizado
 */
export function mergeTrainingData(training, trainingData) {
  return { ...training, ...trainingData };
}

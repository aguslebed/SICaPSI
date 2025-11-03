/**
 * LevelValidator - Funciones puras para validación de niveles
 * Cumple con SRP: Solo responsable de validación de lógica de negocio
 */

/**
 * Extrae los números de nivel de un array de niveles
 * @param {Array} levels - Array de objetos nivel
 * @returns {Array<number>} Array de números de nivel
 */
export function extractLevelNumbers(levels) {
  return levels.map(lvl => lvl.levelNumber).filter(num => typeof num === 'number');
}

/**
 * Verifica si hay niveles duplicados en la BD
 * @param {Array} existingLevels - Niveles existentes en BD
 * @returns {boolean} true si hay duplicados
 */
export function hasDuplicates(existingLevels) {
  return existingLevels.length > 0;
}

/**
 * Crea mensaje de error descriptivo para duplicados
 * @param {Array} existingLevels - Niveles duplicados encontrados
 * @returns {string} Mensaje de error
 */
export function createDuplicateErrorMessage(existingLevels) {
  const duplicateNumbers = existingLevels.map(lvl => lvl.levelNumber).join(', ');
  return `Los siguientes números de nivel ya existen en esta capacitación: ${duplicateNumbers}`;
}

/**
 * Determina si un nivel debe actualizarse o crearse
 * @param {Object} level - Objeto nivel
 * @returns {Object} { shouldUpdate: boolean, hasId: boolean, hasLevelNumber: boolean }
 */
export function determineLevelOperation(level) {
  return {
    shouldUpdate: !!level._id,
    hasId: !!level._id,
    hasLevelNumber: typeof level.levelNumber === 'number'
  };
}

/**
 * Extrae IDs de un array de documentos
 * @param {Array} documents - Array de documentos con _id
 * @returns {Array} Array de IDs
 */
export function extractIds(documents) {
  return documents.map(doc => doc._id);
}

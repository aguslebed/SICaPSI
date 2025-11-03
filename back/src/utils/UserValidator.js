/**
 * UserValidator - Funciones puras para validación de usuarios
 * Cumple con SRP: Solo responsable de validación de lógica de negocio
 */

/**
 * Verifica si un email ya está registrado
 * @param {Object|null} existingUser - Usuario existente encontrado
 * @returns {boolean} true si el email ya existe
 */
export function emailExists(existingUser) {
  return !!existingUser;
}

/**
 * Verifica si un usuario tiene un rol específico
 * @param {string} userRole - Rol del usuario
 * @param {string} targetRole - Rol objetivo
 * @returns {boolean} true si coincide
 */
export function hasRole(userRole, targetRole) {
  return userRole === targetRole;
}

/**
 * Verifica si es un rol de capacitador
 * @param {string} role - Rol del usuario
 * @returns {boolean} true si es Capacitador
 */
export function isTeacher(role) {
  return role === 'Capacitador';
}

/**
 * Verifica si es un rol de alumno
 * @param {string} role - Rol del usuario
 * @returns {boolean} true si es Alumno
 */
export function isStudent(role) {
  return role === 'Alumno';
}

/**
 * Extrae IDs únicos de un array de objetos con _id
 * @param {Array} items - Array de items con _id
 * @returns {Array<string>} Array de IDs únicos
 */
export function extractUniqueIds(items) {
  return [...new Set(items.map(item => item?._id?.toString()).filter(Boolean))];
}

/**
 * Unifica usuarios por ID evitando duplicados
 * @param {Array} usersArray - Arrays de usuarios a unificar
 * @returns {Array} Array de usuarios únicos
 */
export function unifyUsersByIdMultiple(...usersArrays) {
  const byId = new Map();
  for (const users of usersArrays) {
    for (const u of users) {
      byId.set(u._id.toString(), u);
    }
  }
  return Array.from(byId.values());
}

/**
 * Convierte array de ObjectIds a array de strings
 * @param {Array} objectIds - Array de ObjectIds
 * @returns {Array<string>} Array de strings
 */
export function objectIdsToStrings(objectIds) {
  return (objectIds || []).map(id => id.toString());
}

/**
 * Filtra trainings scope según trainingId específico
 * @param {Array<string>} assignedTrainings - Trainings asignados
 * @param {string|null} trainingId - Training específico
 * @returns {Array<string>} Trainings en scope
 */
export function filterTrainingScope(assignedTrainings, trainingId) {
  if (!trainingId) return assignedTrainings;
  
  const tStr = trainingId.toString();
  if (assignedTrainings.includes(tStr)) {
    return [tStr];
  }
  return assignedTrainings;
}

/**
 * Crea objeto de filtro para búsqueda de usuarios
 * @param {Object} query - Query params
 * @returns {Object} Filtro de búsqueda
 */
export function buildUserFilter(query = {}) {
  const filter = {};
  
  if (query.role) {
    filter.role = query.role;
  }
  
  if (query.status) {
    filter.status = query.status;
  }
  
  return filter;
}

/**
 * Crea mensaje de error para email duplicado
 * @returns {string} Mensaje de error
 */
export function createEmailExistsError() {
  return "El mail ya está registrado";
}

/**
 * Crea mensaje de error para usuario no encontrado
 * @returns {string} Mensaje de error
 */
export function createUserNotFoundError() {
  return "Usuario no encontrado";
}

/**
 * Crea mensaje de error para remitente no encontrado
 * @returns {string} Mensaje de error
 */
export function createSenderNotFoundError() {
  return "Usuario remitente no encontrado";
}

/**
 * Crea mensaje de error para contraseña incorrecta
 * @returns {string} Mensaje de error
 */
export function createInvalidPasswordError() {
  return "La contraseña actual es incorrecta";
}

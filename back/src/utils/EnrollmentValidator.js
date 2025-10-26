/**
 * EnrollmentValidator - Funciones puras para validación de inscripciones
 * Cumple con SRP: Solo responsable de validación de lógica de negocio
 */

/**
 * Verifica si un usuario ya está inscrito en una capacitación
 * @param {Array} assignedTraining - Array de IDs de capacitaciones del usuario
 * @param {string} trainingId - ID de la capacitación a verificar
 * @returns {boolean} true si ya está inscrito
 */
export function isAlreadyEnrolled(assignedTraining, trainingId) {
  return assignedTraining.some(id => id.toString() === trainingId.toString());
}

/**
 * Verifica si un usuario NO está inscrito en una capacitación
 * @param {Array} assignedTraining - Array de IDs de capacitaciones del usuario
 * @param {string} trainingId - ID de la capacitación a verificar
 * @returns {boolean} true si NO está inscrito
 */
export function isNotEnrolled(assignedTraining, trainingId) {
  return !isAlreadyEnrolled(assignedTraining, trainingId);
}

/**
 * Filtra IDs de capacitaciones removiendo una específica
 * @param {Array} assignedTraining - Array de IDs de capacitaciones
 * @param {string} trainingId - ID a remover
 * @returns {Array} Array sin el ID especificado
 */
export function removeTrainingFromList(assignedTraining, trainingId) {
  return assignedTraining.filter(
    id => id.toString() !== trainingId.toString()
  );
}

/**
 * Verifica si un usuario tiene el rol de Capacitador
 * @param {string} role - Rol del usuario
 * @returns {boolean} true si es Capacitador
 */
export function isTrainer(role) {
  return role === "Capacitador";
}

/**
 * Verifica si un usuario tiene el rol de Alumno
 * @param {string} role - Rol del usuario
 * @returns {boolean} true si es Alumno
 */
export function isStudent(role) {
  return role === "Alumno";
}

/**
 * Verifica si hay usuarios en un array
 * @param {Array} users - Array de usuarios
 * @returns {boolean} true si hay usuarios
 */
export function hasUsers(users) {
  return users && users.length > 0;
}

/**
 * Crea mensaje de error para usuario no encontrado
 * @returns {string} Mensaje de error
 */
export function createUserNotFoundError() {
  return "Usuario no encontrado";
}

/**
 * Crea mensaje de error para alumno no encontrado
 * @returns {string} Mensaje de error
 */
export function createStudentNotFoundError() {
  return "Alumno no encontrado";
}

/**
 * Crea mensaje de error para capacitación no encontrada
 * @returns {string} Mensaje de error
 */
export function createTrainingNotFoundError() {
  return "Capacitacion no encontrado";
}

/**
 * Crea mensaje de error para usuario ya inscrito
 * @returns {string} Mensaje de error
 */
export function createAlreadyEnrolledError() {
  return "El alumno ya está inscrito en la capacitacion";
}

/**
 * Crea mensaje de error para capacitador ya inscrito
 * @returns {string} Mensaje de error
 */
export function createTrainerAlreadyEnrolledError() {
  return "El capacitador ya está inscrito en la capacitacion";
}

/**
 * Crea mensaje de error para usuario no inscrito
 * @returns {string} Mensaje de error
 */
export function createNotEnrolledError() {
  return "El alumno no está inscrito en la capacitacion";
}

/**
 * Crea mensaje de error para rol no válido
 * @returns {string} Mensaje de error
 */
export function createInvalidRoleError() {
  return "El usuario no es un capacitador";
}

/**
 * Crea mensaje de error para capacitación sin usuarios
 * @returns {string} Mensaje de error
 */
export function createNoUsersEnrolledError() {
  return "No hay usuarios inscritos en esta capacitación";
}

/**
 * Crea mensaje de éxito para inscripción
 * @returns {string} Mensaje de éxito
 */
export function createEnrollmentSuccessMessage() {
  return "Inscripción exitosa";
}

/**
 * Crea mensaje de éxito para desinscripción
 * @returns {string} Mensaje de éxito
 */
export function createUnenrollmentSuccessMessage() {
  return "Alumno desinscripto correctamente";
}

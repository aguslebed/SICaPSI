/**
 * MessageValidator - Funciones puras para validación de mensajes
 * Cumple con SRP: Solo responsable de validación de lógica de negocio
 */

/**
 * Verifica si un userId es propietario de un mensaje
 * @param {Object} message - Mensaje
 * @param {string} userId - ID del usuario
 * @returns {boolean} true si es propietario
 */
export function isMessageOwner(message, userId) {
  const senderId = message.sender?.toString();
  const recipientId = message.recipient?.toString();
  const userIdStr = userId.toString();
  return senderId === userIdStr || recipientId === userIdStr;
}

/**
 * Verifica si un userId es el destinatario de un mensaje
 * @param {Object} message - Mensaje
 * @param {string} userId - ID del usuario
 * @returns {boolean} true si es destinatario
 */
export function isRecipient(message, userId) {
  return message.recipient?.toString() === userId.toString();
}

/**
 * Verifica si un userId es el remitente de un mensaje
 * @param {Object} message - Mensaje
 * @param {string} userId - ID del usuario
 * @returns {boolean} true si es remitente
 */
export function isSender(message, userId) {
  return message.sender?.toString() === userId.toString();
}

/**
 * Determina la carpeta de restauración según el rol del usuario
 * @param {Object} message - Mensaje
 * @param {string} userId - ID del usuario
 * @returns {string} 'inbox' o 'sent'
 */
export function determineRestoreFolder(message, userId) {
  return isRecipient(message, userId) ? 'inbox' : 'sent';
}

/**
 * Verifica si un mensaje está en papelera
 * @param {Object} message - Mensaje
 * @returns {boolean} true si está en trash
 */
export function isInTrash(message) {
  return message.folder === 'trash';
}

/**
 * Calcula la fecha límite (30 días atrás)
 * @returns {Date} Fecha hace 30 días
 */
export function getThirtyDaysAgo() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date;
}

/**
 * Valida si un string parece un email
 * @param {string} value - Valor a validar
 * @returns {boolean} true si parece email
 */
export function looksLikeEmail(value) {
  return typeof value === 'string' && value.includes('@');
}

/**
 * Crea mensaje de error para destinatario no encontrado
 * @returns {string} Mensaje de error
 */
export function createRecipientNotFoundError() {
  return "Destinatario no encontrado";
}

/**
 * Crea mensaje de error para mensaje no encontrado
 * @returns {string} Mensaje de error
 */
export function createMessageNotFoundError() {
  return "Mensaje no encontrado";
}

/**
 * Crea mensaje de error para operación no autorizada
 * @returns {string} Mensaje de error
 */
export function createUnauthorizedError() {
  return "No autorizado";
}

/**
 * Crea mensaje de error para eliminación desde trash
 * @returns {string} Mensaje de error
 */
export function createDeleteFromTrashError() {
  return "Solo se pueden eliminar definitivamente los mensajes en papelera";
}

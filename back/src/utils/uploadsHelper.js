/**
 * Helper para gestionar rutas de uploads de forma consistente
 * Usa la configuración UPLOADS_BASE_PATH del .env
 */

/**
 * Obtiene la ruta base para servir archivos uploads
 * @returns {string} Ruta base configurada (ej: '/uploads' o '/api/uploads')
 */
export function getUploadsBasePath() {
  return process.env.UPLOADS_BASE_PATH || '/uploads';
}

/**
 * Construye una ruta de archivo upload con la base correcta
 * @param {string} relativePath - Ruta relativa (ej: 'trainings/123/file.jpg')
 * @returns {string} Ruta completa (ej: '/api/uploads/trainings/123/file.jpg')
 */
export function buildUploadPath(relativePath) {
  const basePath = getUploadsBasePath();
  // Limpiar slashes duplicados
  const cleanRelative = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  return `${basePath}/${cleanRelative}`.replace(/\/+/g, '/');
}

/**
 * Verifica si una ruta es una ruta de upload válida
 * @param {string} filePath - Ruta a verificar
 * @returns {boolean} true si es una ruta de upload
 */
export function isUploadPath(filePath) {
  if (!filePath || typeof filePath !== 'string') return false;
  return filePath.includes('/uploads/') || filePath.startsWith('/uploads/');
}

/**
 * Normaliza una ruta de upload para trabajar con el filesystem
 * Convierte '/uploads/file.jpg' o '/api/uploads/file.jpg' a 'uploads/file.jpg'
 * @param {string} urlPath - Ruta URL del archivo
 * @returns {string} Ruta del filesystem
 */
export function normalizeUploadPath(urlPath) {
  if (!urlPath) return '';
  
  // Remover /api/uploads/ o /uploads/ del inicio
  let normalized = urlPath
    .replace(/^\/api\/uploads\//, 'uploads/')
    .replace(/^\/uploads\//, 'uploads/');
  
  return normalized;
}

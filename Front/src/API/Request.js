import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Utilidad: resuelve URLs de imagen (prefija host del backend cuando vienen como '/uploads/...')
export function resolveImageUrl(url) {
  if (!url) return url;
  if (typeof url !== 'string') return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/')) return `${API_BASE}${url}`;
  return url;
}

export async function login(email, password) {
  try { 

    // 1. Autenticación: solo recibe la cookie
    await api.post("/auth/login", { email, password });

    // 2. Obtener datos completos del usuario autenticado
    const { data } = await api.get("/users/connect/me"); 

    // Devolver directamente la data (sin envolver en {data})
    return data;
  } catch (error) {
    console.error("❌ Error en login:", error);

    if (error.response) {
      const status = error.response.status;
      const msg = error.response.data?.message; 

      if (status === 401) throw new Error("Credenciales inválidas");
      if (status === 404) throw new Error("Ruta no encontrada");
      throw new Error(msg || "Error en la solicitud");
    } else if (error.request) { 
      throw new Error("Error de conexión con el servidor");
    } else { 
      throw new Error("Error en la configuración de la petición");
    }
  }
}

// Registro de usuario
export async function APIRegistro(usuario) {
  try { 
    const { data } = await api.post("/users/register", usuario); 
     
    return data;
  } catch (error) {
    console.error("❌ Error en registro:", error);
    
    if (error.response) { 
      // Devuelve el objeto de error completo
      throw error.response.data;
    } else if (error.request) { 
      throw { message: "Error de conexión con el servidor" };
    } else { 
      throw { message: "Error en la configuración de la petición" };
    }
  }
}

// Logout de usuario
export async function logout() {
  try {  
    await api.post('/auth/logout', {});
     
    return true;
  } catch (error) {
    console.error("❌ Error en logout:", error);
    
    if (error.response) { 
      throw new Error(error.response.data?.message || 'Error al cerrar sesión');
    } else if (error.request) { 
      throw new Error('Error de conexión con el servidor');
    } else { 
      throw new Error('Error en la configuración de la petición');
    }
  }
}

// Verifica si el usuario está autenticado
export async function checkAuth() {
  try { 
    const { data } = await api.get('/auth/check-auth');
    
    return {
      user: data.user ?? data,
      token: data.token ?? null,
    };
  } catch (error) {
    console.error("❌ Error en checkAuth:", error);
   
    throw new Error('No autenticado');
  }
}

// Obtiene los datos completos del usuario (perfil + training, etc.)
export async function getMe() {
  const { data } = await api.get('/users/connect/me');
  return data;
}

// Actualiza datos del usuario por ID
export async function updateUser(userId, patch) {
  try {
    const { data } = await api.patch(`/users/${userId}`, patch);
    return data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Error al actualizar usuario');
    } else if (error.request) {
      throw new Error('Error de conexión con el servidor');
    } else {
      throw new Error('Error en la configuración de la petición');
    }
  }
}

// Cambia la contraseña del usuario autenticado
export async function changePassword({ currentPassword, newPassword, confirmPassword }) {
  try {
    const { data } = await api.post('/users/change-password', {
      currentPassword,
      newPassword,
      confirmPassword
    });
    return data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Error al cambiar contraseña');
    } else if (error.request) {
      throw new Error('Error de conexión con el servidor');
    } else {
      throw new Error('Error en la configuración de la petición');
    }
  }
}

// Sube una imagen de perfil
export async function uploadProfileImage(userId, file) {
  const form = new FormData();
  form.append('image', file);
  try {
    const { data } = await api.post(`/users/${userId}/profile-image`, form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Error al subir imagen');
    } else if (error.request) {
      throw new Error('Error de conexión con el servidor');
    } else {
      throw new Error('Error en la configuración de la petición');
    }
  }
}

// --- Mensajería ---
export async function sendMessage({ to, subject, body, recipientId, attachments, trainingId, recipientEmails, recipientIds }) {
  // Support multiple recipients: caller can pass recipientEmails (array), recipientIds (array),
  // or a comma-separated `to` string. We will POST once per recipient.
  const jobs = [];
  // Normalize arrays
  if (Array.isArray(recipientIds) && recipientIds.length) {
    for (const id of recipientIds) {
      jobs.push(api.post('/messages', { recipientId: id, subject, body, attachments, trainingId }));
    }
  } else if (Array.isArray(recipientEmails) && recipientEmails.length) {
    for (const email of recipientEmails) {
      jobs.push(api.post('/messages', { to: email, subject, body, attachments, trainingId }));
    }
  } else if (to && typeof to === 'string' && to.includes(',')) {
    const parts = to.split(',').map(s => s.trim()).filter(Boolean);
    for (const email of parts) jobs.push(api.post('/messages', { to: email, subject, body, attachments, trainingId }));
  } else {
    // single recipient (recipientId may be provided, or to as string)
    jobs.push(api.post('/messages', { to, subject, body, recipientId, attachments, trainingId }));
  }

  try {
    const results = await Promise.all(jobs);
    // Return array of data when multiple, or single data when one
    const datas = results.map(r => r.data);
    return datas.length === 1 ? datas[0] : datas;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Error al enviar mensaje');
    } else if (error.request) {
      throw new Error('Error de conexión con el servidor');
    } else {
      throw new Error('Error en la configuración de la petición');
    }
  }
}

export async function setMessageRead({ id, isRead }) {
  try {
    const { data } = await api.patch(`/messages/${id}/read`, { isRead });
    return data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Error al actualizar lectura');
    } else if (error.request) {
      throw new Error('Error de conexión con el servidor');
    } else {
      throw new Error('Error en la configuración de la petición');
    }
  }
}

export async function moveMessageToTrash(id) {
  try {
    const { data } = await api.post(`/messages/${id}/trash`);
    return data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Error al mover a papelera');
    } else if (error.request) {
      throw new Error('Error de conexión con el servidor');
    } else {
      throw new Error('Error en la configuración de la petición');
    }
  }
}

// --- Operaciones en lote (cliente) ---
export async function bulkMoveToTrash(ids = []) {
  await Promise.all(ids.map((id) => moveMessageToTrash(id)));
}

export async function bulkSetMessageRead(ids = [], isRead) {
  await Promise.all(ids.map((id) => setMessageRead({ id, isRead })));
}

export async function restoreMessage(id) {
  try {
    const { data } = await api.post(`/messages/${id}/restore`);
    return data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Error al restaurar mensaje');
    } else if (error.request) {
      throw new Error('Error de conexión con el servidor');
    } else {
      throw new Error('Error en la configuración de la petición');
    }
  }
}

export async function bulkRestoreMessages(ids = []) {
  await Promise.all(ids.map((id) => restoreMessage(id)));
}

export async function deleteMessagePermanent(id) {
  try {
    const { data } = await api.delete(`/messages/${id}`);
    return data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Error al eliminar mensaje');
    } else if (error.request) {
      throw new Error('Error de conexión con el servidor');
    } else {
      throw new Error('Error en la configuración de la petición');
    }
  }
}

export async function bulkDeleteMessagesPermanent(ids = []) {
  await Promise.all(ids.map((id) => deleteMessagePermanent(id)));
}

// Lista de usuarios para seleccionar destinatarios
export async function listUsers(query = {}) {
  try {
    // If trainingId is provided, hit recipients endpoint to restrict to teachers/classmates
    const params = new URLSearchParams(query);
    let url = '/users';
    if (query && (query.trainingId || params.get('trainingId'))) {
      url = `/users/recipients?${params.toString()}`;
    } else {
      url = `/users?${params.toString()}`;
    }
    const { data } = await api.get(url);
    return data; // se asume que ya viene formateado por el formatter
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Error al listar usuarios');
    } else if (error.request) {
      throw new Error('Error de conexión con el servidor');
    } else {
      throw new Error('Error en la configuración de la petición');
    }
  }
}

// Subir adjuntos de mensajes
export async function uploadMessageAttachments(files) {
  const form = new FormData();
  for (const f of files) form.append('files', f);
  try {
    const { data } = await api.post('/messages/attachments', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data.attachments;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Error al subir adjuntos');
    } else if (error.request) {
      throw new Error('Error de conexión con el servidor');
    } else {
      throw new Error('Error en la configuración de la petición');
    }
  }
}

// Listar profesores 
// CAMBIO: Ruta actualizada para usar el endpoint correcto en userRoutes
export async function listTeachers() {
  try {
    const { data } = await api.get('/users/admin/teachers');
    return Array.isArray(data) ? data : (data?.items || []);
  } catch (error) {
    console.error("❌ Error al obtener profesores:", error);
    // Devolver array vacío en caso de error para evitar crasheos
    return [];
  }
}

// Cambiar estado (bloquear/habilitar)
// CAMBIO: Ruta actualizada para usar el endpoint correcto en userRoutes
export async function setTeacherStatus(id, status) {
  const { data } = await api.patch(`/users/admin/teachers/${id}/status`, { status });
  return data;
}

// Listar capacitaciones activas
export async function getAllActiveTrainings() {
  try {
    const { data } = await api.get('/training/getAllActiveTrainings'); 
    return data;
  } catch (error) {
    // Re-lanzar error para que el caller lo maneje
    throw error;
  }
}

export async function getAllTrainings() {
  try {
    const { data } = await api.get('/training/getAllTrainings'); 
    return data;
  } catch (error) { 
    throw error;
  }
}

// Obtener datos para la página de AdmisionUsuario
export async function fetchAdmisionUsuarios() {
  try {
    const { data } = await api.get("/admision-usuarios");
    return data;
  } catch (error) {
    console.error("Error fetching admision usuarios:", error);
    throw error;
  }
}

export async function getAllUsers() {
  try {
    const { data } = await api.get("/users");
    return data;
  } catch (error) {
    console.error("Error fetching usuarios:", error);
    throw error;
  }
}

// Obtener solo guardias para inscripción en capacitaciones
export async function getStudents(role = 'Alumno') {
  try {
    // Filtrar por rol (por defecto 'Alumno'). Antes se usaba 'Guardia'.
    const { data } = await api.get(`/users?role=${encodeURIComponent(role)}`);
    return Array.isArray(data) ? data : (data?.items || []);
  } catch (error) {
    console.error("Error obteniendo usuarios por rol:", error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Error al obtener usuarios');
    } else if (error.request) {
      throw new Error('Error de conexión con el servidor');
    } else {
      throw new Error('Error en la configuración de la petición');
    }
  }
}

export async function deleteUser(userId) {
  try {
    const { data } = await api.delete(`/users/${userId}`);
    return data;
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Error al eliminar usuario');
    } else if (error.request) {
      throw new Error('Error de conexión con el servidor');
    } else {
      throw new Error('Error en la configuración de la petición');
    }
  }
}

export async function getEnrolledStudents(trainingId) {
  try {
    const { data } = await api.get(`/users/training/${trainingId}/enrolled`);
    return Array.isArray(data) ? data : (data?.items || []);
  } catch (error) {
    console.error("Error obteniendo guardias inscritos:", error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Error al obtener guardias inscritos');
    } else if (error.request) {
      throw new Error('Error de conexión con el servidor');
    } else {
      throw new Error('Error en la configuración de la petición');
    }
  }
}

// Obtener usuarios inscritos en una capacitación usando el servicio de enrollment
export async function getUsersEnrolledInTraining(trainingId) {
  try {
  // Use query params for GET so backend can read req.query.trainingId
  const { data } = await api.get(`/enrollment/getUsersEnrolledInTraining`, { params: { trainingId } });
    return Array.isArray(data) ? data : (data?.items || []);
  } catch (error) {
    console.log(trainingId, "---desde request.js---");
    console.error('Error obteniendo usuarios inscritos (enrollment):', error);
    if (error.response) {
      // If backend returns an object with message or errors, forward that message
      throw new Error(error.response.data?.message || 'Error al obtener usuarios inscritos');
    }
    if (error.request) {
      throw new Error('Error de conexión con el servidor');
    }
    throw new Error('Error en la configuración de la petición');
  }
}

// --- CAPACITACIONES Y NIVELES ---

// Crear una nueva capacitación
export async function createTraining(trainingData) {
  try {
    const { data } = await api.post('/training/createTraining', trainingData);
    return data;
  } catch (error) {
    console.error("❌ Error creando capacitación:", error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Error al crear capacitación');
    } else if (error.request) {
      throw new Error('Error de conexión con el servidor');
    } else {
      throw new Error('Error en la configuración de la petición');
    }
  }
}

// Obtener todos los niveles de una capacitación
export async function getAllLevelsInTraining(trainingId) {
  try {
    // Nota: El backend espera trainingId en el body, pero es GET request
    // Necesitaríamos cambiar el backend o usar POST. Por ahora, usaremos POST.
    const { data } = await api.post('/level/getAlllevelsInTraining', {
      trainingId
    });
    return data;
  } catch (error) {
    console.error("❌ Error obteniendo niveles:", error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Error al obtener niveles');
    } else if (error.request) {
      throw new Error('Error de conexión con el servidor');
    } else {
      throw new Error('Error en la configuración de la petición');
    }
  }
}

// Agregar niveles a una capacitación
export async function addLevelsToTraining(trainingId, levels) {
  try {
    const { data } = await api.post('/level/addLevelsToTraining', {
      trainingId,
      levels
    });
    return data;
  } catch (error) {
    console.error("❌ Error agregando niveles:", error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Error al agregar niveles');
    } else if (error.request) {
      throw new Error('Error de conexión con el servidor');
    } else {
      throw new Error('Error en la configuración de la petición');
    }
  }
}

// Actualizar niveles de una capacitación
export async function updateLevelsInTraining(trainingId, levels) {
  try {
    const { data } = await api.put('/level/updateLevelsInTraining', {
      trainingId,
      levels
    });
    return data;
  } catch (error) {
    console.error("❌ Error actualizando niveles:", error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Error al actualizar niveles');
    } else if (error.request) {
      throw new Error('Error de conexión con el servidor');
    } else {
      throw new Error('Error en la configuración de la petición');
    }
  }
}

// Subir imagen para capacitación
export async function uploadTrainingImage(file) {
  const form = new FormData();
  form.append('image', file);
  try {
    const { data } = await api.post('/training/upload-image', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  } catch (error) {
    console.error("❌ Error subiendo imagen:", error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Error al subir imagen');
    } else if (error.request) {
      throw new Error('Error de conexión con el servidor');
    } else {
      throw new Error('Error en la configuración de la petición');
    }
  }
}

// Subir archivo de video/material para training
export async function uploadTrainingFile(file) {
  const form = new FormData();
  form.append('file', file);
  try {
    const { data } = await api.post('/training/upload-file', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  } catch (error) {
    console.error("❌ Error subiendo archivo:", error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Error al subir archivo');
    } else if (error.request) {
      throw new Error('Error de conexión con el servidor');
    } else {
      throw new Error('Error en la configuración de la petición');
    }
  }
}

// Eliminar archivo subido
export async function deleteTrainingFile(filePath) {
  try {
    const { data } = await api.delete('/training/delete-file', {
      data: { filePath }
    });
    return data;
  } catch (error) {
    console.error("❌ Error eliminando archivo:", error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Error al eliminar archivo');
    } else if (error.request) {
      throw new Error('Error de conexión con el servidor');
    } else {
      throw new Error('Error en la configuración de la petición');
    }
  }
}

// Obtener una capacitación por ID
export async function getTrainingById(trainingId) {
  try {
    // Agregar timestamp para evitar caché y obtener datos frescos
    const timestamp = new Date().getTime();
    const { data } = await api.get(`/training/${trainingId}?_t=${timestamp}`);
    console.log('🔄 Datos frescos obtenidos del backend:', data);
    return data;
  } catch (error) {
    console.error("❌ Error obteniendo capacitación:", error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Error al obtener capacitación');
    } else if (error.request) {
      throw new Error('Error de conexión con el servidor');
    } else {
      throw new Error('Error en la configuración de la petición');
    }
  }
}

// Actualizar una capacitación
export async function updateTraining(trainingId, trainingData) {
  try {

    const { data } = await api.patch(`/training/${trainingId}`, trainingData);
    return data;
  } catch (error) {
    console.error("❌ Error actualizando capacitación:", error);
    console.error("❌ Response data:", error.response?.data);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Datos inválidos');
    } else if (error.request) {
      throw new Error('Error de conexión con el servidor');
    } else {
      throw new Error('Error en la configuración de la petición');
    }
  }
}

// Eliminar una capacitación
export async function deleteTraining(trainingId) {
  try {
    const { data } = await api.delete(`/training/${trainingId}`);
    return data;
  } catch (error) {
    console.error("❌ Error eliminando capacitación:", error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Error al eliminar capacitación');
    } else if (error.request) {
      throw new Error('Error de conexión con el servidor');
    } else {
      throw new Error('Error en la configuración de la petición');
    }
  }
}

// Inscribir estudiantes a una capacitación
export async function enrollStudentsToTraining(trainingId, studentIds) {
  try {
    const { data } = await api.post('/enrollment/enrollStudent', {
      trainingId,
      userIds: studentIds // El backend espera 'userIds', no 'studentIds'
    });
    return data;
  } catch (error) {
    console.error("❌ Error inscribiendo estudiantes:", error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Error al inscribir estudiantes');
    } else if (error.request) {
      throw new Error('Error de conexión con el servidor');
    } else {
      throw new Error('Error en la configuración de la petición');
    }
  }
}
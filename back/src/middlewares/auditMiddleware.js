/**
 * Middleware de Auditoría para SICaPSI
 * Intercepta y registra automáticamente las acciones del sistema
 */
import AuditLog from '../models/AuditLog.js';

/**
 * Crea un middleware de auditoría para una acción específica
 * @param {string} action - Tipo de acción a auditar
 * @param {string} resource - Tipo de recurso afectado
 * @param {Object} options - Opciones de configuración
 */
export function createAuditMiddleware(action, resource = null, options = {}) {
  return (req, res, next) => {
    const startTime = Date.now();
    
    // Interceptar el método send para capturar la respuesta
    const originalSend = res.send;
    const originalJson = res.json;
    
    let responseData = null;
    let responseStatus = null;
    
    // Override send method
    res.send = function(data) {
      responseData = data;
      responseStatus = this.statusCode;
      return originalSend.call(this, data);
    };
    
    // Override json method
    res.json = function(data) {
      responseData = data;
      responseStatus = this.statusCode;
      return originalJson.call(this, data);
    };
    
    // Interceptar el final de la respuesta
    res.on('finish', async () => {
      try {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Determinar si la operación fue exitosa
        const success = responseStatus >= 200 && responseStatus < 400;
        
        // Extraer información del usuario
        let user = req.user;
        let userSnapshot = null;
        
        // Para LOGIN_SUCCESS, intentar obtener usuario de req.authenticatedUser si no hay req.user
        if (!user && action === 'LOGIN_SUCCESS' && req.authenticatedUser) {
          user = req.authenticatedUser;
        }
        
        // Para USER_CREATED sin usuario autenticado (registro público), crear usuario temporal
        if (!user && action === 'USER_CREATED') {
          // Intentar obtener datos del nuevo usuario creado
          const newUserData = req.body || res.locals.createdUser || {};
          user = {
            _id: 'system',
            email: 'system@sicapsi.com',
            role: 'system',
            firstName: 'Sistema',
            lastName: 'SICaPSI'
          };
          console.log('Auditoría: Registro de usuario público detectado');
        }
        
        if (!user) {
          console.warn('Auditoría: Usuario no disponible en request para acción:', action);
          return;
        }
        
        // Crear snapshot del usuario
        userSnapshot = {
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          documentNumber: user.documentNumber
        };
        
        // Extraer detalles de la request
        const details = {
          httpMethod: req.method,
          endpoint: req.originalUrl || req.url,
          requestParams: {
            params: req.params,
            query: req.query,
            // Solo incluir body para operaciones de escritura (no GET)
            ...(req.method !== 'GET' && { body: sanitizeRequestBody(req.body) })
          },
          responseStatus: responseStatus,
          changedFields: options.extractChangedFields ? options.extractChangedFields(req, responseData) : undefined,
          // Incluir contexto adicional si está disponible
          ...(req.auditContext && { context: req.auditContext })
        };
        
        // Extraer información del dispositivo
        const userAgent = req.get('User-Agent') || '';
        const deviceInfo = parseUserAgent(userAgent);
        
        // Determinar recurso ID del request
        const resourceId = extractResourceId(req, options);
        
        // Determinar severidad
        const severity = determineSeverity(action, success, responseStatus);
        
        // Extraer snapshots si es necesario
        const { beforeSnapshot, afterSnapshot } = await extractSnapshots(req, responseData, options);
        
        // Crear entry de auditoría
        const auditData = {
          userId: user.userId || user._id,
          userSnapshot,
          action,
          resource,
          resourceId,
          beforeSnapshot,
          afterSnapshot,
          details,
          metadata: {
            ipAddress: getClientIP(req),
            userAgent,
            sessionId: req.sessionID || extractSessionId(req),
            deviceInfo
          },
          success,
          errorMessage: success ? null : extractErrorMessage(responseData),
          duration,
          severity,
          tags: options.tags || []
        };
        
        // Registrar en auditoría (de forma asíncrona para no bloquear)
        await AuditLog.logAction(auditData);
        
      } catch (error) {
        console.error('Error en middleware de auditoría:', error);
        // No interrumpir el flujo normal
      }
    });
    
    next();
  };
}

/**
 * Middleware específico para acciones de autenticación
 */
export function auditAuth(action) {
  return createAuditMiddleware(action, 'USER', {
    extractChangedFields: (req, responseData) => {
      if (action === 'LOGIN_SUCCESS') {
        return ['lastLogin'];
      }
      return [];
    },
    tags: ['authentication']
  });
}

/**
 * Middleware para auditar cambios en usuarios
 */
export function auditUserChange(action) {
  return createAuditMiddleware(action, 'USER', {
    extractChangedFields: (req, responseData) => {
      if (req.body) {
        return Object.keys(req.body);
      }
      return [];
    },
    extractSnapshots: true,
    tags: ['user-management']
  });
}

/**
 * Middleware para auditar cambios de estado de usuario con detección automática
 */
export function auditUserStatusChange(req, res, next) {
  const userId = req.params.id;
  const changes = req.body;
  
  console.log('🔍 AuditUserStatusChange: Detectando acción para cambios:', changes);
  
  // Detectar tipo de acción según el estado
  let action = 'USER_STATUS_CHANGED';
  
  // Caso 1: Aprobar usuario (status = 'available')
  if (changes.status === 'available') {
    action = 'USER_APPROVED';
    console.log('🔍 AuditUserStatusChange: Detectado aprobación de usuario');
  } 
  // Caso 2: Rechazar usuario (status = 'disabled' o 'rejected')
  else if (changes.status === 'disabled' || changes.status === 'rejected') {
    action = 'USER_REJECTED';
    console.log('🔍 AuditUserStatusChange: Detectado rechazo de usuario');
  }
  
  console.log('🔍 AuditUserStatusChange: Acción final detectada:', action);
  
  // Aplicar el middleware dinámico con la acción detectada
  const dynamicMiddleware = createAuditMiddleware(action, 'USER', {
    extractChangedFields: (req, responseData) => {
      return ['status'];
    },
    extractSnapshots: true,
    tags: ['user-management', 'status-change']
  });
  
  return dynamicMiddleware(req, res, next);
}

/**
 * Middleware para auditar cambios en capacitaciones con detección automática de acciones
 */
export function auditTrainingChange(req, res, next) {
  const trainingId = req.params.id;
  const changes = req.body;
  
  console.log('🔍 AuditTrainingChange: Detectando acción para cambios:', changes);
  
  // Detectar tipo de acción según los cambios
  let action = 'TRAINING_UPDATED';
  let description = 'Capacitación actualizada';

  // Caso 1: Enviar a aprobar (pendingApproval = true)
  if (changes.pendingApproval === true) {
    action = 'TRAINING_SUBMITTED_FOR_APPROVAL';
    description = 'Capacitación enviada para aprobación';
    console.log('🔍 AuditTrainingChange: Detectado envío a aprobación');
  } 
  // Caso 2: Aprobar (isActive = true, pendingApproval = false)
  else if (changes.isActive === true && changes.pendingApproval === false) {
    action = 'TRAINING_APPROVED';
    description = 'Capacitación aprobada';
    console.log('🔍 AuditTrainingChange: Detectado aprobación');
  } 
  // Caso 3: Rechazar (rejectionReason presente)
  else if (changes.rejectionReason && changes.rejectionReason.trim().length > 0) {
    action = 'TRAINING_REJECTED';
    description = 'Capacitación rechazada';
    console.log('🔍 AuditTrainingChange: Detectado rechazo');
  }
  else {
    console.log('🔍 AuditTrainingChange: Detectado actualización general');
  }

  console.log('🔍 AuditTrainingChange: Acción final detectada:', action);

  // Crear el middleware dinámico con la acción detectada
  const dynamicMiddleware = createAuditMiddleware(action, 'TRAINING', {
    extractChangedFields: (req, responseData) => {
      if (req.body) {
        const sensitiveFields = ['isActive', 'pendingApproval', 'rejectedBy', 'rejectionReason'];
        const allFields = Object.keys(req.body);
        return allFields.filter(field => sensitiveFields.includes(field)).length > 0 
          ? sensitiveFields.filter(field => req.body.hasOwnProperty(field))
          : allFields;
      }
      return [];
    },
    extractSnapshots: true,
    tags: ['training-management']
  });

  // Ejecutar el middleware dinámico
  return dynamicMiddleware(req, res, next);
}

/**
 * Middleware para auditar cambios en capacitaciones (versión con parámetro action)
 */
export function auditTrainingChangeWithAction(action) {
  return createAuditMiddleware(action, 'TRAINING', {
    extractChangedFields: (req, responseData) => {
      if (req.body) {
        const sensitiveFields = ['isActive', 'pendingApproval', 'rejectedBy', 'rejectionReason'];
        const allFields = Object.keys(req.body);
        return allFields.filter(field => sensitiveFields.includes(field)).length > 0 
          ? sensitiveFields.filter(field => req.body.hasOwnProperty(field))
          : allFields;
      }
      return [];
    },
    extractSnapshots: true,
    tags: ['training-management']
  });
}

/**
 * Middleware para auditar acceso a paneles administrativos
 */
export function auditPanelAccess(panelType) {
  return createAuditMiddleware(`${panelType.toUpperCase()}_PANEL_ACCESS`, 'SYSTEM', {
    tags: ['panel-access', 'security']
  });
}

/**
 * Middleware específico para auditar intentos de login
 * Detecta automáticamente si fue exitoso o fallido
 */
export function auditLogin() {
  return (req, res, next) => {
    const startTime = Date.now();
    
    // Interceptar el método send para capturar la respuesta
    const originalSend = res.send;
    const originalJson = res.json;
    
    let responseData = null;
    let responseStatus = null;
    
    // Override send method
    res.send = function(data) {
      responseData = data;
      responseStatus = this.statusCode;
      return originalSend.call(this, data);
    };
    
    // Override json method
    res.json = function(data) {
      responseData = data;
      responseStatus = this.statusCode;
      return originalJson.call(this, data);
    };
    
    // Interceptar el final de la respuesta
    res.on('finish', async () => {
      try {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Determinar si el login fue exitoso basado en el status code
        const success = responseStatus >= 200 && responseStatus < 400;
        const action = success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED';
        
        let user = null;
        let userSnapshot = null;
        
        if (success) {
          // Login exitoso: obtener usuario autenticado
          user = req.authenticatedUser || req.user;
          if (user) {
            userSnapshot = {
              email: user.email,
              role: user.role,
              firstName: user.firstName,
              lastName: user.lastName,
              documentNumber: user.documentNumber
            };
          }
        } else {
          // Login fallido: crear snapshot con email del intento
          const attemptEmail = req.body?.email || 'unknown';
          user = {
            _id: 'failed_attempt',
            email: attemptEmail,
            role: 'unknown',
            firstName: 'Intento',
            lastName: 'Fallido'
          };
          userSnapshot = {
            email: attemptEmail,
            role: 'unknown',
            firstName: 'Intento',
            lastName: 'Fallido'
          };
        }
        
        if (!user) {
          console.warn('Auditoría: No se pudo obtener información del usuario para login');
          return;
        }
        
        // Extraer detalles de la request (sin password)
        const details = {
          httpMethod: req.method,
          endpoint: req.originalUrl || req.url,
          requestParams: {
            query: req.query,
            body: sanitizeRequestBody(req.body)
          },
          responseStatus: responseStatus,
          changedFields: success ? ['lastLogin'] : []
        };
        
        // Extraer información del dispositivo
        const userAgent = req.get('User-Agent') || '';
        const deviceInfo = parseUserAgent(userAgent);
        
        // Determinar severidad
        const severity = success ? 'LOW' : 'MEDIUM';
        
        // Crear entry de auditoría
        const auditData = {
          userId: user.userId || user._id,
          userSnapshot,
          action,
          resource: 'USER',
          resourceId: success ? (user.userId || user._id) : null,
          details,
          metadata: {
            ipAddress: getClientIP(req),
            userAgent,
            deviceInfo
          },
          success,
          errorMessage: success ? null : extractErrorMessage(responseData),
          duration,
          severity,
          tags: ['authentication']
        };
        
        // Registrar en auditoría
        await AuditLog.logAction(auditData);
        
      } catch (error) {
        console.error('Error en middleware de auditoría login:', error);
      }
    });
    
    next();
  };
}

// Funciones auxiliares

function sanitizeRequestBody(body) {
  if (!body) return null;
  
  // Crear copia para no modificar original
  const sanitized = { ...body };
  
  // Remover campos sensibles
  const sensitiveFields = ['password', 'currentPassword', 'newPassword', 'confirmPassword'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

function parseUserAgent(userAgent) {
  // Extracción básica de información del user agent
  const info = {
    browser: 'Unknown',
    os: 'Unknown',
    device: 'Unknown'
  };
  
  if (userAgent.includes('Chrome')) info.browser = 'Chrome';
  else if (userAgent.includes('Firefox')) info.browser = 'Firefox';
  else if (userAgent.includes('Safari')) info.browser = 'Safari';
  else if (userAgent.includes('Edge')) info.browser = 'Edge';
  
  if (userAgent.includes('Windows')) info.os = 'Windows';
  else if (userAgent.includes('Mac')) info.os = 'macOS';
  else if (userAgent.includes('Linux')) info.os = 'Linux';
  else if (userAgent.includes('Android')) info.os = 'Android';
  else if (userAgent.includes('iOS')) info.os = 'iOS';
  
  if (userAgent.includes('Mobile')) info.device = 'Mobile';
  else if (userAgent.includes('Tablet')) info.device = 'Tablet';
  else info.device = 'Desktop';
  
  return info;
}

function getClientIP(req) {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.headers['x-forwarded-for']?.split(',')[0] ||
         req.headers['x-real-ip'] ||
         'Unknown';
}

function extractResourceId(req, options) {
  // Buscar ID en parámetros
  if (req.params.id) return req.params.id;
  if (req.params.trainingId) return req.params.trainingId;
  if (req.params.userId) return req.params.userId;
  
  // Buscar en el body para creaciones
  if (req.body && req.body._id) return req.body._id;
  
  // Función personalizada si se proporciona
  if (options.extractResourceId) {
    return options.extractResourceId(req);
  }
  
  return null;
}

function determineSeverity(action, success, statusCode) {
  // Acciones críticas
  const criticalActions = [
    'USER_DELETED', 'TRAINING_DELETED', 'SYSTEM_BACKUP', 
    'SYSTEM_RESTORE', 'CONFIG_CHANGED', 'UNAUTHORIZED_ACCESS'
  ];
  
  // Acciones de alta prioridad
  const highActions = [
    'USER_ROLE_CHANGED', 'TRAINING_APPROVED', 'TRAINING_REJECTED',
    'USER_STATUS_CHANGED', 'PERMISSION_DENIED'
  ];
  
  // Acciones de media prioridad
  const mediumActions = [
    'USER_CREATED', 'USER_UPDATED', 'TRAINING_CREATED', 
    'TRAINING_UPDATED', 'LOGIN_FAILED'
  ];
  
  if (!success || statusCode >= 500) return 'CRITICAL';
  if (criticalActions.includes(action)) return 'CRITICAL';
  if (highActions.includes(action)) return 'HIGH';
  if (mediumActions.includes(action)) return 'MEDIUM';
  
  return 'LOW';
}

function extractSessionId(req) {
  // Extraer session ID del token JWT o session
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    // Aquí podrías decodificar el JWT para extraer información de sesión
    return token?.substring(0, 10) + '...'; // Truncado por seguridad
  }
  return null;
}

function extractErrorMessage(responseData) {
  if (typeof responseData === 'object' && responseData.message) {
    return responseData.message;
  }
  if (typeof responseData === 'string') {
    return responseData;
  }
  return 'Error sin mensaje específico';
}

async function extractSnapshots(req, responseData, options) {
  let beforeSnapshot = null;
  let afterSnapshot = null;
  
  if (options.extractSnapshots && req.method !== 'GET') {
    // Para actualizaciones, intentar obtener el estado anterior
    if (req.params.id && (req.method === 'PUT' || req.method === 'PATCH')) {
      // Aquí implementarías la lógica para obtener el estado anterior
      // del recurso basado en el modelo correspondiente
      beforeSnapshot = await getResourceSnapshot(options.resource || 'USER', req.params.id);
    }
    
    // El estado posterior viene en la respuesta
    if (responseData && typeof responseData === 'object') {
      afterSnapshot = responseData;
    }
  }
  
  return { beforeSnapshot, afterSnapshot };
}

async function getResourceSnapshot(resourceType, resourceId) {
  try {
    switch (resourceType) {
      case 'USER':
        const User = (await import('../models/User.js')).default;
        return await User.findById(resourceId).lean();
      case 'TRAINING':
        const Training = (await import('../models/Training.js')).default;
        return await Training.findById(resourceId).lean();
      default:
        return null;
    }
  } catch (error) {
    console.error('Error obteniendo snapshot:', error);
    return null;
  }
}

export default createAuditMiddleware;
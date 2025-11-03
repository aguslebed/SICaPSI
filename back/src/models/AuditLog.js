/**
 * Modelo de Auditoría para SICaPSI
 * Registra todas las acciones críticas del sistema
 */
import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema({
  // Usuario que realizó la acción
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Información del usuario (snapshot para histórico)
  userSnapshot: {
    email: { type: String, required: true },
    role: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    documentNumber: { type: String }
  },
  
  // Acción realizada
  action: { 
    type: String, 
    required: true,
    enum: [
      // Autenticación
      'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'PASSWORD_CHANGED',
      
      // Gestión de Usuarios
      'USER_CREATED', 'USER_UPDATED', 'USER_STATUS_CHANGED', 'USER_DELETED',
      'USER_APPROVED', 'USER_REJECTED',
      
      // Capacitaciones
      'TRAINING_CREATED', 'TRAINING_UPDATED', 'TRAINING_DELETED',
      'TRAINING_APPROVED', 'TRAINING_REJECTED', 'TRAINING_SUBMITTED_FOR_APPROVAL',
      
      // Inscripciones y Asignaciones
      'STUDENT_ENROLLED', 'STUDENT_UNENROLLED',
      'TRAINER_ASSIGNED', 'TRAINER_UNASSIGNED'
    ]
  },
  
  // Recurso afectado
  resource: { 
    type: String,
    enum: ['USER', 'TRAINING', 'LEVEL', 'MESSAGE', 'REPORT', 'SYSTEM', 'FILE']
  },
  
  // ID del recurso afectado
  resourceId: { 
    type: mongoose.Schema.Types.ObjectId 
  },
  
  // Snapshot del recurso antes del cambio (para cambios)
  beforeSnapshot: { 
    type: mongoose.Schema.Types.Mixed 
  },
  
  // Snapshot del recurso después del cambio
  afterSnapshot: { 
    type: mongoose.Schema.Types.Mixed 
  },
  
  // Detalles adicionales de la acción
  details: {
    // Campos específicos modificados
    changedFields: [String],
    
    // Valores anteriores
    oldValues: mongoose.Schema.Types.Mixed,
    
    // Valores nuevos  
    newValues: mongoose.Schema.Types.Mixed,
    
    // Contexto adicional
    context: mongoose.Schema.Types.Mixed,
    
    // Método HTTP utilizado
    httpMethod: String,
    
    // Endpoint accedido
    endpoint: String,
    
    // Parámetros de la request
    requestParams: mongoose.Schema.Types.Mixed,
    
    // Código de respuesta HTTP
    responseStatus: Number
  },
  
  // Información técnica
  metadata: {
    ipAddress: { type: String },
    userAgent: { type: String },
    sessionId: { type: String },
    deviceInfo: {
      browser: String,
      os: String,
      device: String
    }
  },
  
  // Estado de la operación
  success: { 
    type: Boolean, 
    default: true 
  },
  
  // Mensaje de error si falló
  errorMessage: { 
    type: String 
  },
  
  // Duración de la operación (en ms)
  duration: { 
    type: Number 
  },
  
  // Timestamp
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  
  // Nivel de criticidad
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  
  // Tags para categorización
  tags: [String],
  
  // Marcas de retención
  retentionDate: {
    type: Date
  }
}, { 
  timestamps: true,
  // Mantener histórico completo
  versionKey: false
});

// Índices para optimización de consultas
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ resource: 1, resourceId: 1 });
AuditLogSchema.index({ success: 1, severity: 1 });
AuditLogSchema.index({ 'metadata.ipAddress': 1 });
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ retentionDate: 1 }, { expireAfterSeconds: 0 });

// Virtual para obtener descripción legible de la acción
AuditLogSchema.virtual('actionDescription').get(function() {
  const descriptions = {
    'LOGIN_SUCCESS': 'Inicio de sesión exitoso',
    'LOGIN_FAILED': 'Intento de inicio de sesión fallido',
    'LOGOUT': 'Cierre de sesión',
    'PASSWORD_CHANGED': 'Contraseña cambiada',
    'USER_CREATED': 'Usuario creado',
    'USER_UPDATED': 'Usuario actualizado',
    'USER_STATUS_CHANGED': 'Estado de usuario modificado',
    'USER_DELETED': 'Usuario eliminado',
    'USER_APPROVED': 'Usuario aprobado',
    'USER_REJECTED': 'Usuario rechazado',
    'TRAINING_CREATED': 'Capacitación creada',
    'TRAINING_UPDATED': 'Capacitación actualizada',
    'TRAINING_DELETED': 'Capacitación eliminada',
    'TRAINING_APPROVED': 'Capacitación aprobada',
    'TRAINING_REJECTED': 'Capacitación rechazada',
    'TRAINING_SUBMITTED_FOR_APPROVAL': 'Capacitación enviada para aprobación',
    'STUDENT_ENROLLED': 'Estudiante inscrito',
    'STUDENT_UNENROLLED': 'Estudiante desinscrito',
    'TRAINER_ASSIGNED': 'Capacitador asignado',
    'TRAINER_UNASSIGNED': 'Capacitador desasignado'
  };
  return descriptions[this.action] || this.action;
});

// Método estático para registrar auditoría
AuditLogSchema.statics.logAction = async function(auditData) {
  try {
    // Calcular retención automática (por defecto 7 años)
    const retentionDate = new Date();
    retentionDate.setFullYear(retentionDate.getFullYear() + 7);
    
    const auditEntry = new this({
      ...auditData,
      retentionDate,
      timestamp: new Date()
    });
    
    await auditEntry.save();
    return auditEntry;
  } catch (error) {
    console.error('Error registrando auditoría:', error);
    // No interrumpir la operación principal si falla la auditoría
    return null;
  }
};

// Método estático para registrar acciones de auditoría
AuditLogSchema.statics.logAction = async function(auditData) {
  try {
    const auditEntry = new this(auditData);
    await auditEntry.save();
    console.log('✅ Auditoría registrada:', auditData.action, 'por usuario:', auditData.userSnapshot?.email);
    return auditEntry;
  } catch (error) {
    console.error('❌ Error registrando auditoría:', error);
    // No interrumpir la operación principal si falla la auditoría
    return null;
  }
};

// Método para buscar eventos relacionados
AuditLogSchema.statics.findRelatedEvents = async function(resourceType, resourceId, timeWindow = 24) {
  const startTime = new Date();
  startTime.setHours(startTime.getHours() - timeWindow);
  
  return this.find({
    resource: resourceType,
    resourceId: resourceId,
    timestamp: { $gte: startTime }
  }).sort({ timestamp: -1 });
};

export default mongoose.model("AuditLog", AuditLogSchema);
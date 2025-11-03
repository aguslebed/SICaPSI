/**
 * Servicio de Auditoría para SICaPSI
 * Proporciona métodos para consultar y gestionar logs de auditoría
 */
import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';
import ExcelJS from 'exceljs';

export class AuditService {
  
  /**
   * Obtiene logs de auditoría con filtros y paginación
   * @param {Object} filters - Filtros de búsqueda
   * @param {Object} pagination - Configuración de paginación
   * @returns {Object} Logs paginados con metadatos
   */
  async getLogs(filters = {}, pagination = { page: 1, limit: 50 }) {
    try {
      console.log('🔍 AuditService.getLogs called with:', { filters, pagination });
      const query = this.buildQuery(filters);
      
      // Expandir filtro de nombre de trainer
      if (filters.trainerName) {
        const nameRegex = { $regex: filters.trainerName, $options: 'i' };
        
        // Buscar usuarios que coincidan con el nombre
        const User = (await import('../models/User.js')).default;
        const matchingUsers = await User.find({
          $or: [
            { firstName: nameRegex },
            { lastName: nameRegex },
            { $expr: { 
              $regexMatch: { 
                input: { $concat: ['$firstName', ' ', '$lastName'] }, 
                regex: filters.trainerName, 
                options: 'i' 
              }
            }}
          ]
        }).select('_id').lean();
        
        const userIds = matchingUsers.map(u => u._id);
        console.log('👥 Usuarios que coinciden con:', filters.trainerName, '→', userIds.length, 'usuarios');
        
        // Reemplazar el marcador con la condición real
        if (query.$and) {
          const trainerFilterIndex = query.$and.findIndex(condition => condition._trainerNameFilter);
          if (trainerFilterIndex !== -1) {
            query.$and[trainerFilterIndex] = {
              $or: [
                // Buscar por userId de usuarios que coinciden
                { userId: { $in: userIds } },
                // Buscar en snapshots
                { 'userSnapshot.firstName': nameRegex },
                { 'userSnapshot.lastName': nameRegex },
                { $expr: { 
                  $regexMatch: { 
                    input: { $concat: ['$userSnapshot.firstName', ' ', '$userSnapshot.lastName'] }, 
                    regex: filters.trainerName, 
                    options: 'i' 
                  }
                }}
              ]
            };
          }
        }
      }
      
      console.log('📝 Generated MongoDB query:', JSON.stringify(query, null, 2));
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;
      
      // Ejecutar consulta con población de referencias
      const [logs, total] = await Promise.all([
        AuditLog.find(query)
          .populate('userId', 'firstName lastName email role documentNumber')
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        AuditLog.countDocuments(query)
      ]);
      
      console.log('📊 Query results:', { 
        totalInDB: await AuditLog.countDocuments({}), 
        totalFiltered: total, 
        logsReturned: logs.length 
      });
      
      // DEBUG: Si no hay resultados filtrados, mostrar algunas fechas de ejemplo
      if (total === 0 && (filters.startDate || filters.endDate)) {
        const sampleLogs = await AuditLog.find({}).sort({ timestamp: -1 }).limit(3).select('timestamp action').lean();
        console.log('🔍 DEBUG: Fechas de ejemplo en la BD:', sampleLogs.map(log => ({
          action: log.action,
          timestamp: log.timestamp,
          timestampISO: log.timestamp?.toISOString()
        })));
        
        console.log('🔍 DEBUG: Rango de búsqueda:', {
          startDate: filters.startDate,
          endDate: filters.endDate,
          startDateParsed: filters.startDate ? new Date(filters.startDate) : null,
          endDateParsed: filters.endDate ? new Date(filters.endDate) : null
        });
      }
      
      return {
        logs: logs.map(log => this.formatLogEntry(log)),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Error obteniendo logs de auditoría:', error);
      throw new Error('Error al consultar logs de auditoría');
    }
  }
  
  /**
   * Obtiene estadísticas de auditoría
   * @param {Object} dateRange - Rango de fechas
   * @returns {Object} Estadísticas calculadas
   */
  async getStatistics(dateRange = {}) {
    try {
      const { startDate, endDate } = dateRange;
      const matchStage = {};
      
      if (startDate || endDate) {
        matchStage.timestamp = {};
        if (startDate) matchStage.timestamp.$gte = new Date(startDate);
        if (endDate) matchStage.timestamp.$lte = new Date(endDate);
      }
      
      const [
        actionStats,
        userStats,
        errorStats,
        dailyStats,
        severityStats
      ] = await Promise.all([
        this.getActionStatistics(matchStage),
        this.getUserStatistics(matchStage),
        this.getErrorStatistics(matchStage),
        this.getDailyStatistics(matchStage),
        this.getSeverityStatistics(matchStage)
      ]);
      
      return {
        summary: {
          totalEvents: await AuditLog.countDocuments(matchStage),
          uniqueUsers: userStats.length,
          errorRate: errorStats.errorRate,
          period: { startDate, endDate }
        },
        actions: actionStats,
        users: userStats,
        errors: errorStats,
        daily: dailyStats,
        severity: severityStats
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw new Error('Error al calcular estadísticas');
    }
  }
  
  /**
   * Obtiene eventos relacionados a un recurso específico
   * @param {string} resourceType - Tipo de recurso
   * @param {string} resourceId - ID del recurso
   * @param {number} timeWindow - Ventana de tiempo en horas
   * @returns {Array} Eventos relacionados
   */
  async getRelatedEvents(resourceType, resourceId, timeWindow = 24) {
    try {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() - timeWindow);
      
      const events = await AuditLog.find({
        resource: resourceType,
        resourceId: resourceId,
        timestamp: { $gte: startTime }
      })
      .populate('userId', 'firstName lastName email role')
      .sort({ timestamp: -1 })
      .lean();
      
      return events.map(event => this.formatLogEntry(event));
    } catch (error) {
      console.error('Error obteniendo eventos relacionados:', error);
      throw new Error('Error al obtener eventos relacionados');
    }
  }
  
  /**
   * Obtiene el historial de cambios de un recurso
   * @param {string} resourceType - Tipo de recurso
   * @param {string} resourceId - ID del recurso
   * @returns {Array} Historial de cambios
   */
  async getChangeHistory(resourceType, resourceId) {
    try {
      const changes = await AuditLog.find({
        resource: resourceType,
        resourceId: resourceId,
        action: { $regex: /(CREATED|UPDATED|DELETED|APPROVED|REJECTED|STATUS_CHANGED)/ }
      })
      .populate('userId', 'firstName lastName email role')
      .sort({ timestamp: 1 })
      .lean();
      
      return changes.map(change => ({
        ...this.formatLogEntry(change),
        changeDetails: this.extractChangeDetails(change)
      }));
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      throw new Error('Error al obtener historial de cambios');
    }
  }
  
  /**
   * Genera reporte de auditoría para exportación
   * @param {Object} filters - Filtros de búsqueda
   * @param {string} format - Formato de salida (json, csv)
   * @returns {Object} Datos del reporte
   */
  async generateReport(filters = {}, format = 'json') {
    try {
      const query = this.buildQuery(filters);
      
      const logs = await AuditLog.find(query)
        .populate('userId', 'firstName lastName email role documentNumber')
        .sort({ timestamp: -1 })
        .lean();
      
      const formattedLogs = logs.map(log => this.formatLogForReport(log));
      
      if (format === 'csv') {
        return this.convertToCSV(formattedLogs);
      }
      
      return {
        metadata: {
          generatedAt: new Date(),
          totalRecords: formattedLogs.length,
          filters: filters,
          format: format
        },
        data: formattedLogs
      };
    } catch (error) {
      console.error('Error generando reporte:', error);
      throw new Error('Error al generar reporte de auditoría');
    }
  }
  
  /**
   * Limpia logs antiguos según políticas de retención
   * @param {number} retentionDays - Días de retención
   * @returns {Object} Resultado de la limpieza
   */
  async cleanupOldLogs(retentionDays = 2555) { // ~7 años por defecto
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      
      const result = await AuditLog.deleteMany({
        timestamp: { $lt: cutoffDate },
        severity: { $nin: ['CRITICAL'] } // No eliminar eventos críticos
      });
      
      return {
        deletedCount: result.deletedCount,
        cutoffDate: cutoffDate
      };
    } catch (error) {
      console.error('Error limpiando logs:', error);
      throw new Error('Error al limpiar logs antiguos');
    }
  }
  
  // Métodos privados
  
  buildQuery(filters) {
    const query = {};
    const andConditions = [];
    
    // Filtros simples (AND)
    if (filters.userId) query.userId = filters.userId;
    if (filters.action) query.action = filters.action;
    if (filters.resource) query.resource = filters.resource;
    if (filters.resourceId) query.resourceId = filters.resourceId;
    if (filters.success !== undefined) query.success = filters.success;
    if (filters.severity) query.severity = filters.severity;
    if (filters.ipAddress) query['metadata.ipAddress'] = filters.ipAddress;
    
    // Filtros de texto
    if (filters.userEmail) {
      query['userSnapshot.email'] = { $regex: filters.userEmail, $options: 'i' };
    }
    if (filters.userRole) {
      query['userSnapshot.role'] = filters.userRole;
    }
    
    // Filtros de fecha
    if (filters.startDate || filters.endDate) {
      const dateFilter = {};
      if (filters.startDate) {
        dateFilter.$gte = new Date(filters.startDate);
        console.log('📅 Filtro fecha inicio:', filters.startDate, '→', dateFilter.$gte);
      }
      if (filters.endDate) {
        dateFilter.$lte = new Date(filters.endDate);
        console.log('📅 Filtro fecha fin:', filters.endDate, '→', dateFilter.$lte);
      }
      andConditions.push({ timestamp: dateFilter });
    }
    
    // Filtros de búsqueda general (OR)
    if (filters.search) {
      const searchRegex = { $regex: filters.search, $options: 'i' };
      andConditions.push({
        $or: [
          { 'userSnapshot.email': searchRegex },
          { 'userSnapshot.firstName': searchRegex },
          { 'userSnapshot.lastName': searchRegex },
          { action: searchRegex },
          { errorMessage: searchRegex }
        ]
      });
    }

    // Filtro por capacitador (trainer) - puede venir en body.userIds o resourceId
    if (filters.trainerId) {
      andConditions.push({
        $or: [
          { 'details.requestParams.body.userIds': filters.trainerId },
          { 'details.requestParams.body.userId': filters.trainerId },
          { resourceId: filters.trainerId },
          { 'afterSnapshot._id': filters.trainerId },
          { 'beforeSnapshot._id': filters.trainerId }
        ]
      });
    }

    // Filtro por nombre del capacitador (simplificado - se expandirá en getLogs)
    if (filters.trainerName) {
      andConditions.push({ _trainerNameFilter: filters.trainerName });
    }

    // Filtro por capacitación (training)
    if (filters.trainingId) {
      andConditions.push({
        $or: [
          { resourceId: filters.trainingId },
          { 'details.context.trainingId': filters.trainingId },
          { 'details.requestParams.body.trainingId': filters.trainingId }
        ]
      });
    }
    
    // Combinar filtros AND con las condiciones OR
    if (andConditions.length > 0) {
      query.$and = andConditions;
    }
    
    return query;
  }
  
  formatLogEntry(log) {
    return {
      id: log._id,
      timestamp: log.timestamp,
      user: {
        id: log.userId?._id || log.userId,
        name: log.userId ? `${log.userId.firstName} ${log.userId.lastName}` : 
              `${log.userSnapshot.firstName} ${log.userSnapshot.lastName}`,
        email: log.userId?.email || log.userSnapshot.email,
        role: log.userId?.role || log.userSnapshot.role,
        documentNumber: log.userId?.documentNumber || log.userSnapshot.documentNumber
      },
      action: log.action,
      actionDescription: this.getActionDescription(log.action, log.details),
      resource: log.resource,
      resourceId: log.resourceId,
      success: log.success,
      severity: log.severity,
      duration: log.duration,
      ipAddress: log.metadata?.ipAddress,
      userAgent: log.metadata?.userAgent,
      deviceInfo: log.metadata?.deviceInfo,
      errorMessage: log.errorMessage,
      details: log.details
    };
  }
  
  formatLogForReport(log) {
    const formatted = this.formatLogEntry(log);
    return {
      'Fecha/Hora': formatted.timestamp.toISOString(),
      'Usuario': formatted.user.name,
      'Email': formatted.user.email,
      'Rol': formatted.user.role,
      'DNI': formatted.user.documentNumber,
      'Acción': formatted.actionDescription,
      'Recurso': formatted.resource,
      'IP Address': formatted.ipAddress,
      'Éxito': formatted.success ? 'Sí' : 'No',
      'Severidad': formatted.severity,
      'Duración (ms)': formatted.duration,
      'Navegador': formatted.deviceInfo?.browser,
      'SO': formatted.deviceInfo?.os,
      'Dispositivo': formatted.deviceInfo?.device,
      'Mensaje Error': formatted.errorMessage || 'N/A'
    };
  }
  
  getActionDescription(action, details = {}) {
    const descriptions = {
      'LOGIN_SUCCESS': 'Inicio de sesión exitoso',
      'LOGIN_FAILED': 'Intento de inicio de sesión fallido',
      'LOGOUT': 'Cierre de sesión',
      'PASSWORD_CHANGED': 'Cambio de contraseña',
      'USER_CREATED': 'Usuario creado',
      'USER_UPDATED': 'Usuario actualizado',
      'USER_DELETED': 'Usuario eliminado',
      'USER_STATUS_CHANGED': 'Estado de usuario modificado',
      'USER_ROLE_CHANGED': 'Rol de usuario modificado',
      'STUDENT_BLOCKED': 'Bloqueo de alumno',
      'STUDENT_ENABLED': 'Habilitación de alumno', 
      'STUDENT_DELETED': 'Eliminación de alumno',
      'TEACHER_BLOCKED': 'Bloqueo de profesor',
      'TEACHER_ENABLED': 'Habilitación de profesor',
      'TEACHER_DELETED': 'Eliminación de profesor',
      'TRAINING_CREATED': 'Capacitación creada',
      'TRAINING_UPDATED': 'Capacitación actualizada',
      'TRAINING_DELETED': 'Capacitación eliminada',
      'TRAINING_APPROVED': 'Capacitación aprobada',
      'TRAINING_REJECTED': 'Capacitación rechazada',
      'TRAINING_PUBLISHED': 'Capacitación publicada',
      'TEACHER_ASSIGNED_TO_TRAINING': 'Profesor asignado a capacitación',
      'TEACHER_REMOVED_FROM_TRAINING': 'Profesor removido de capacitación',
      'REPORT_GENERATED': 'Reporte generado',
      'DATA_EXPORTED': 'Datos exportados',
      'UNAUTHORIZED_ACCESS': 'Acceso no autorizado',
      'PERMISSION_DENIED': 'Permisos denegados'
    };
    
    let baseDescription = descriptions[action] || action;
    
    // Agregar contexto específico para acciones de profesores en capacitaciones
    if ((action === 'TEACHER_ASSIGNED_TO_TRAINING' || action === 'TEACHER_REMOVED_FROM_TRAINING') 
        && details.context && details.context.trainingTitle) {
      const verb = action === 'TEACHER_ASSIGNED_TO_TRAINING' ? 'asignado a' : 'removido de';
      // Sanitizar título por si tiene HTML
      const cleanTitle = this.sanitizeHtml(details.context.trainingTitle);
      baseDescription = `Profesor ${verb} capacitación "${cleanTitle}"`;
    }
    
    return baseDescription;
  }
  
  /**
   * Limpia HTML de un texto
   * @param {string} text - Texto que puede contener HTML
   * @returns {string} Texto limpio sin HTML
   */
  sanitizeHtml(text) {
    if (!text || typeof text !== 'string') return text || '';
    return text.replace(/<[^>]*>/g, '').trim();
  }
  
  extractChangeDetails(change) {
    const details = change.details || {};
    const changeDetails = {};
    
    if (details.changedFields) {
      changeDetails.fieldsChanged = details.changedFields;
    }
    
    if (details.oldValues && details.newValues) {
      changeDetails.changes = {};
      Object.keys(details.newValues).forEach(field => {
        if (details.oldValues[field] !== details.newValues[field]) {
          changeDetails.changes[field] = {
            from: details.oldValues[field],
            to: details.newValues[field]
          };
        }
      });
    }
    
    return changeDetails;
  }
  
  async getActionStatistics(matchStage) {
    return AuditLog.aggregate([
      { $match: matchStage },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
  }
  
  async getUserStatistics(matchStage) {
    return AuditLog.aggregate([
      { $match: matchStage },
      { $group: { 
        _id: '$userId', 
        count: { $sum: 1 },
        lastActivity: { $max: '$timestamp' },
        email: { $first: '$userSnapshot.email' },
        role: { $first: '$userSnapshot.role' }
      }},
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
  }
  
  async getErrorStatistics(matchStage) {
    const total = await AuditLog.countDocuments(matchStage);
    const errors = await AuditLog.countDocuments({ ...matchStage, success: false });
    
    const errorsByAction = await AuditLog.aggregate([
      { $match: { ...matchStage, success: false } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    return {
      total,
      errors,
      errorRate: total > 0 ? (errors / total * 100).toFixed(2) : 0,
      errorsByAction
    };
  }
  
  async getDailyStatistics(matchStage) {
    return AuditLog.aggregate([
      { $match: matchStage },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        count: { $sum: 1 },
        errors: { $sum: { $cond: ['$success', 0, 1] } }
      }},
      { $sort: { _id: 1 } }
    ]);
  }
  
  async getSeverityStatistics(matchStage) {
    return AuditLog.aggregate([
      { $match: matchStage },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
  }
  
  /**
   * Genera un reporte Excel con todos los datos de auditoría
   * @param {Object} filters - Filtros aplicados a los datos
   * @returns {Buffer} Buffer del archivo Excel
   */
  async generateExcelReport(filters = {}) {
    try {
      console.log('📊 Generating Excel report with filters:', filters);
      
      // Obtener todos los logs sin paginación
      const query = this.buildQuery(filters);
      
      // Expandir filtro de nombre de trainer (mismo código que en getLogs)
      if (filters.trainerName) {
        const nameRegex = { $regex: filters.trainerName, $options: 'i' };
        const User = (await import('../models/User.js')).default;
        const matchingUsers = await User.find({
          $or: [
            { firstName: nameRegex },
            { lastName: nameRegex },
            { $expr: { 
              $regexMatch: { 
                input: { $concat: ['$firstName', ' ', '$lastName'] }, 
                regex: filters.trainerName, 
                options: 'i' 
              }
            }}
          ]
        }).select('_id').lean();
        
        const userIds = matchingUsers.map(u => u._id);
        
        if (query.$and) {
          const trainerFilterIndex = query.$and.findIndex(condition => condition._trainerNameFilter);
          if (trainerFilterIndex !== -1) {
            query.$and[trainerFilterIndex] = {
              $or: [
                { userId: { $in: userIds } },
                { 'userSnapshot.firstName': nameRegex },
                { 'userSnapshot.lastName': nameRegex },
                { $expr: { 
                  $regexMatch: { 
                    input: { $concat: ['$userSnapshot.firstName', ' ', '$userSnapshot.lastName'] }, 
                    regex: filters.trainerName, 
                    options: 'i' 
                  }
                }}
              ]
            };
          }
        }
      }

      console.log('📝 Excel query:', JSON.stringify(query, null, 2));
      
      const logs = await AuditLog.find(query)
        .sort({ timestamp: -1 })
        .lean();

      console.log('📊 Found', logs.length, 'records for Excel export');

      // Convertir datos a formato amigable para Excel
      const excelData = logs.map(log => ({
        'Fecha y Hora': this.formatDateTime(log.timestamp),
        'Acción Realizada': this.formatAction(log.action),
        'Usuario': this.formatUserName(log.userSnapshot),
        'Email del Usuario': log.userSnapshot?.email || 'N/A',
        'Rol': this.formatRole(log.userSnapshot?.role),
        'Resultado': log.success ? 'Exitoso' : 'Error',
        'Dirección IP': log.ipAddress || 'N/A',
        'Navegador': this.formatUserAgent(log.userAgent),
        'Descripción': log.description || 'N/A',
        'Capacitación Afectada': this.formatTrainingName(log.trainingSnapshot),
        'Datos Anteriores': this.formatSnapshot(log.beforeSnapshot),
        'Datos Nuevos': this.formatSnapshot(log.afterSnapshot),
        'Información Adicional': this.formatMetadata(log.metadata),
        'ID de Registro': log._id.toString()
      }));

      // Crear workbook y worksheet usando exceljs
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Reporte de Auditoría');

      // Si no hay datos, devolver un workbook con solo encabezados
      const headers = excelData.length > 0 ? Object.keys(excelData[0]) : [
        'Fecha y Hora','Acción Realizada','Usuario','Email del Usuario','Rol','Resultado',
        'Dirección IP','Navegador','Descripción','Capacitación Afectada','Datos Anteriores',
        'Datos Nuevos','Información Adicional','ID de Registro'
      ];

      // Configurar columnas con anchos aproximados (en caracteres)
      const columnWidths = [20,25,25,30,15,10,15,20,40,30,30,30,30,25];
      worksheet.columns = headers.map((h, idx) => ({ header: h, key: h, width: columnWidths[idx] || 20 }));

      // Agregar filas
      for (const rowObj of excelData) {
        // Mantener el orden de headers
        const row = headers.map(h => {
          const v = rowObj[h];
          // Asegurar que los valores primitivos o strings sean escritos correctamente
          if (v === null || v === undefined) return '';
          if (typeof v === 'object') return JSON.stringify(v);
          return v;
        });
        worksheet.addRow(row);
      }

      // Opcional: aplicar estilo mínimo al header (negrita)
      worksheet.getRow(1).font = { bold: true };

      // Generar buffer del archivo Excel (xlsx)
      const excelBuffer = await workbook.xlsx.writeBuffer();
      console.log('✅ Excel report generated successfully (exceljs)');
      return Buffer.from(excelBuffer);

    } catch (error) {
      console.error('❌ Error generating Excel report:', error);
      throw error;
    }
  }

  // Funciones auxiliares para formatear datos
  formatDateTime(timestamp) {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/Argentina/Buenos_Aires'
    });
  }

  formatAction(action) {
    const actionMap = {
      // Autenticación
      'LOGIN_SUCCESS': 'Inicio de Sesión Exitoso',
      'LOGIN_FAILED': 'Intento de Inicio de Sesión Fallido',
      'LOGOUT': 'Cierre de Sesión',
      'PASSWORD_CHANGED': 'Contraseña Cambiada',
      
      // Usuarios
      'USER_STATUS_CHANGED': 'Estado de Usuario Cambiado',
      'USER_CREATED': 'Usuario Creado',
      'USER_UPDATED': 'Usuario Actualizado',
      'USER_DELETED': 'Usuario Eliminado',
      'USER_APPROVED': 'Usuario Aprobado',
      'USER_REJECTED': 'Usuario Rechazado',
      
      // Capacitaciones
      'TRAINING_CREATED': 'Capacitación Creada',
      'TRAINING_UPDATED': 'Capacitación Actualizada',
      'TRAINING_DELETED': 'Capacitación Eliminada',
      'TRAINING_APPROVED': 'Capacitación Aprobada',
      'TRAINING_REJECTED': 'Capacitación Rechazada',
      'TRAINING_SUBMITTED_FOR_APPROVAL': 'Capacitación Enviada para Aprobación',
      
      // Inscripciones y Asignaciones
      'STUDENT_ENROLLED': 'Estudiante Inscrito',
      'STUDENT_UNENROLLED': 'Estudiante Desinscrito',
      'TRAINER_ASSIGNED': 'Capacitador Asignado',
      'TRAINER_UNASSIGNED': 'Capacitador Desasignado'
    };
    return actionMap[action] || action;
  }

  formatUserName(userSnapshot) {
    if (!userSnapshot) return 'N/A';
    const firstName = userSnapshot.firstName || '';
    const lastName = userSnapshot.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'N/A';
  }

  formatRole(role) {
    const roleMap = {
      'Capacitador': 'Capacitador',
      'Directivo': 'Directivo',
      'Admin': 'Administrador'
    };
    return roleMap[role] || role || 'N/A';
  }

  formatUserAgent(userAgent) {
    if (!userAgent) return 'N/A';
    // Extraer información básica del navegador
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Otro';
  }

  formatTrainingName(trainingSnapshot) {
    if (!trainingSnapshot) return 'N/A';
    return trainingSnapshot.title || trainingSnapshot.name || 'N/A';
  }

  formatSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') return 'N/A';
    const keys = Object.keys(snapshot);
    if (keys.length === 0) return 'N/A';
    
    // Mostrar solo los campos más relevantes para no saturar
    const relevantFields = ['title', 'name', 'firstName', 'lastName', 'email', 'role', 'status'];
    const relevantData = {};
    
    relevantFields.forEach(field => {
      if (snapshot[field] !== undefined) {
        relevantData[field] = snapshot[field];
      }
    });
    
    if (Object.keys(relevantData).length === 0) {
      // Si no hay campos relevantes, mostrar los primeros 3 campos
      const firstThree = keys.slice(0, 3);
      firstThree.forEach(key => {
        relevantData[key] = snapshot[key];
      });
    }
    
    return Object.entries(relevantData)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }

  formatMetadata(metadata) {
    if (!metadata || typeof metadata !== 'object') return 'N/A';
    return Object.entries(metadata)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }

  convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escapar valores que contengan comas o comillas
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  }
}

export default AuditService;
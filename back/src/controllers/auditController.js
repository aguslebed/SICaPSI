/**
 * Controlador de Auditoría para SICaPSI
 * Maneja las peticiones HTTP relacionadas con logs de auditoría
 */
import AuditService from '../services/AuditService.js';
import AppError from '../middlewares/AppError.js';

export function makeAuditController() {
  const auditService = new AuditService();

  return {
    /**
     * Obtiene logs de auditoría con filtros y paginación
     * GET /api/audit/logs
     */
    async getLogs(req, res, next) {
      try {
        // Verificar permisos (solo Directivos y Administradores)
        if (!['Directivo', 'Administrador'].includes(req.user.role)) {
          throw new AppError('Acceso denegado. Permisos insuficientes.', 403);
        }

        const filters = {
          userId: req.query.userId,
          action: req.query.action,
          resource: req.query.resource,
          resourceId: req.query.resourceId,
          success: req.query.success !== undefined ? req.query.success === 'true' : undefined,
          severity: req.query.severity,
          ipAddress: req.query.ipAddress,
          userEmail: req.query.userEmail,
          userRole: req.query.userRole,
          startDate: req.query.startDate,
          endDate: req.query.endDate,
          search: req.query.search
        };

        // Remover filtros vacíos
        Object.keys(filters).forEach(key => {
          if (filters[key] === undefined || filters[key] === null || filters[key] === '') {
            delete filters[key];
          }
        });

        const pagination = {
          page: parseInt(req.query.page) || 1,
          limit: Math.min(parseInt(req.query.limit) || 50, 100) // Max 100 registros por página
        };

        const result = await auditService.getLogs(filters, pagination);
        
        res.json({
          success: true,
          data: result.logs,
          pagination: result.pagination,
          filters: filters
        });
      } catch (error) {
        next(error);
      }
    },

    /**
     * Obtiene estadísticas de auditoría
     * GET /api/audit/statistics
     */
    async getStatistics(req, res, next) {
      try {
        // Verificar permisos
        if (!['Directivo', 'Administrador'].includes(req.user.role)) {
          throw new AppError('Acceso denegado. Permisos insuficientes.', 403);
        }

        const dateRange = {
          startDate: req.query.startDate,
          endDate: req.query.endDate
        };

        const statistics = await auditService.getStatistics(dateRange);
        
        res.json({
          success: true,
          data: statistics
        });
      } catch (error) {
        next(error);
      }
    },

    /**
     * Obtiene eventos relacionados a un recurso
     * GET /api/audit/related/:resourceType/:resourceId
     */
    async getRelatedEvents(req, res, next) {
      try {
        // Verificar permisos
        if (!['Directivo', 'Administrador'].includes(req.user.role)) {
          throw new AppError('Acceso denegado. Permisos insuficientes.', 403);
        }

        const { resourceType, resourceId } = req.params;
        const timeWindow = parseInt(req.query.timeWindow) || 24;

        if (!resourceType || !resourceId) {
          throw new AppError('Tipo de recurso e ID son requeridos', 400);
        }

        const events = await auditService.getRelatedEvents(resourceType, resourceId, timeWindow);
        
        res.json({
          success: true,
          data: events,
          metadata: {
            resourceType,
            resourceId,
            timeWindow
          }
        });
      } catch (error) {
        next(error);
      }
    },

    /**
     * Obtiene historial de cambios de un recurso
     * GET /api/audit/history/:resourceType/:resourceId
     */
    async getChangeHistory(req, res, next) {
      try {
        // Verificar permisos
        if (!['Directivo', 'Administrador'].includes(req.user.role)) {
          throw new AppError('Acceso denegado. Permisos insuficientes.', 403);
        }

        const { resourceType, resourceId } = req.params;

        if (!resourceType || !resourceId) {
          throw new AppError('Tipo de recurso e ID son requeridos', 400);
        }

        const history = await auditService.getChangeHistory(resourceType, resourceId);
        
        res.json({
          success: true,
          data: history,
          metadata: {
            resourceType,
            resourceId
          }
        });
      } catch (error) {
        next(error);
      }
    },

    /**
     * Genera y descarga reporte de auditoría
     * POST /api/audit/reports/generate
     */
    async generateReport(req, res, next) {
      try {
        // Verificar permisos
        if (!['Directivo', 'Administrador'].includes(req.user.role)) {
          throw new AppError('Acceso denegado. Permisos insuficientes.', 403);
        }

        const filters = req.body.filters || {};
        const format = req.body.format || 'json';

        if (!['json', 'csv'].includes(format)) {
          throw new AppError('Formato no válido. Use json o csv', 400);
        }

        const report = await auditService.generateReport(filters, format);
        
        // Configurar headers para descarga
        if (format === 'csv') {
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="audit-report-${Date.now()}.csv"`);
          res.send(report);
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Disposition', `attachment; filename="audit-report-${Date.now()}.json"`);
          res.json(report);
        }
      } catch (error) {
        next(error);
      }
    },

    /**
     * Obtiene métricas en tiempo real para dashboard
     * GET /api/audit/dashboard
     */
    async getDashboardMetrics(req, res, next) {
      try {
        // Verificar permisos
        if (!['Directivo', 'Administrador'].includes(req.user.role)) {
          throw new AppError('Acceso denegado. Permisos insuficientes.', 403);
        }

        // Métricas de las últimas 24 horas
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        const [
          todayStats,
          recentFailedLogins,
          recentCriticalEvents,
          topUsers,
          topActions
        ] = await Promise.all([
          auditService.getStatistics({ startDate: yesterday, endDate: now }),
          auditService.getLogs(
            { action: 'LOGIN_FAILED', startDate: yesterday }, 
            { page: 1, limit: 10 }
          ),
          auditService.getLogs(
            { severity: 'CRITICAL', startDate: yesterday }, 
            { page: 1, limit: 10 }
          ),
          auditService.getLogs({}, { page: 1, limit: 5 }), // Para obtener usuarios más activos
          auditService.getStatistics({ startDate: yesterday })
        ]);

        res.json({
          success: true,
          data: {
            summary: todayStats.summary,
            recentFailedLogins: recentFailedLogins.logs,
            recentCriticalEvents: recentCriticalEvents.logs,
            topActions: todayStats.actions.slice(0, 5),
            topUsers: todayStats.users.slice(0, 5),
            errorRate: todayStats.errors.errorRate,
            lastUpdated: new Date()
          }
        });
      } catch (error) {
        next(error);
      }
    },

    /**
     * Buscar eventos de auditoría con texto libre
     * GET /api/audit/search
     */
    async searchEvents(req, res, next) {
      try {
        // Verificar permisos
        if (!['Directivo', 'Administrador'].includes(req.user.role)) {
          throw new AppError('Acceso denegado. Permisos insuficientes.', 403);
        }

        const searchTerm = req.query.q;
        if (!searchTerm || searchTerm.trim().length < 2) {
          throw new AppError('Término de búsqueda debe tener al menos 2 caracteres', 400);
        }

        const filters = {
          search: searchTerm.trim(),
          startDate: req.query.startDate,
          endDate: req.query.endDate
        };

        const pagination = {
          page: parseInt(req.query.page) || 1,
          limit: Math.min(parseInt(req.query.limit) || 20, 50)
        };

        const result = await auditService.getLogs(filters, pagination);
        
        res.json({
          success: true,
          data: result.logs,
          pagination: result.pagination,
          searchTerm: searchTerm
        });
      } catch (error) {
        next(error);
      }
    },

    /**
     * Obtiene resumen de actividad de un usuario específico
     * GET /api/audit/users/:userId/activity
     */
    async getUserActivity(req, res, next) {
      try {
        // Verificar permisos
        if (!['Directivo', 'Administrador'].includes(req.user.role)) {
          throw new AppError('Acceso denegado. Permisos insuficientes.', 403);
        }

        const { userId } = req.params;
        const days = parseInt(req.query.days) || 30;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const [userLogs, userStats] = await Promise.all([
          auditService.getLogs(
            { userId, startDate }, 
            { page: 1, limit: 100 }
          ),
          auditService.getStatistics({ userId, startDate })
        ]);

        res.json({
          success: true,
          data: {
            userId,
            period: { days, startDate },
            recentActivity: userLogs.logs,
            statistics: userStats,
            summary: {
              totalEvents: userStats.summary.totalEvents,
              errorRate: userStats.errors.errorRate,
              topActions: userStats.actions.slice(0, 5)
            }
          }
        });
      } catch (error) {
        next(error);
      }
    },

    /**
     * Limpia logs antiguos (solo para administradores)
     * DELETE /api/audit/cleanup
     */
    async cleanupLogs(req, res, next) {
      try {
        // Solo administradores pueden limpiar logs
        if (req.user.role !== 'Administrador') {
          throw new AppError('Acceso denegado. Solo administradores pueden limpiar logs.', 403);
        }

        const retentionDays = parseInt(req.body.retentionDays) || 2555; // 7 años por defecto

        if (retentionDays < 365) {
          throw new AppError('El período de retención no puede ser menor a 365 días', 400);
        }

        const result = await auditService.cleanupOldLogs(retentionDays);
        
        res.json({
          success: true,
          message: 'Limpieza de logs completada',
          data: result
        });
      } catch (error) {
        next(error);
      }
    }
  };
}

export default makeAuditController;
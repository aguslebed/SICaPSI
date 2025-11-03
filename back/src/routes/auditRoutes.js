/**
 * Rutas de Auditoría para SICaPSI
 * Define endpoints para consultar y gestionar logs de auditoría
 */
import { Router } from "express";
import makeAuthMiddleware from "../middlewares/authMiddleware.js";
import { JwtTokenService } from "../services/JwtTokenService.js";

const router = Router();

console.log('🚀 AuditRoutes module loaded successfully');

// Resolver secret igual que en userRoutes.js
const resolvedSecret = (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32)
    ? process.env.JWT_SECRET
    : (process.env.NODE_ENV === 'production' ? null : 'dev_secret_please_override_0123456789abcdef');

console.log('🔑 JWT Secret resolved:', resolvedSecret ? 'OK' : 'FAILED');

// Crear servicios y middleware como en userRoutes.js
const jwtTokenService = new JwtTokenService({ secret: resolvedSecret });
const authMiddleware = makeAuthMiddleware({ tokenService: jwtTokenService });

console.log('🛡️ Auth middleware created successfully');

// Admin middleware para verificar permisos administrativos
const adminMiddleware = (req, res, next) => {
  if (!req.user || !['Administrador', 'Directivo'].includes(req.user.role)) {
    return res.status(403).json({ 
      message: 'Acceso denegado. Se requieren permisos de administrador.' 
    });
  }
  next();
};

// Ruta de test sin autenticación
router.get('/ping', (req, res) => {
  console.log('📍 /audit/ping called');
  res.json({
    success: true,
    message: "Audit routes working",
    timestamp: new Date().toISOString()
  });
});

// Ruta de test para verificar autenticación
router.get('/auth-test', authMiddleware, (req, res) => {
  console.log('🔐 /audit/auth-test called');
  console.log('👤 User data:', req.user);
  res.json({
    success: true,
    message: "Usuario autenticado correctamente",
    user: {
      id: req.user?.id,
      email: req.user?.email,
      role: req.user?.role,
      firstName: req.user?.firstName,
      lastName: req.user?.lastName
    }
  });
});

// Rutas principales de auditoría (con autenticación y permisos de admin)
router.get('/logs', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    console.log('🔍 Audit logs route called');
    console.log('👤 User:', req.user);
    console.log('🔍 Query params:', req.query);
    
    const AuditService = (await import('../services/AuditService.js')).default;
    const auditService = new AuditService();
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      action: req.query.action,
      search: req.query.search,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      trainerId: req.query.trainerId,
      trainerName: req.query.trainerName, // Nuevo: búsqueda por nombre
      trainingId: req.query.trainingId
    };

    console.log('📊 Calling auditService.getLogs with:', { filters, page, limit });
    const result = await auditService.getLogs(filters, { page, limit });
    console.log('✅ Result:', { logsCount: result.logs?.length, pagination: result.pagination });
    
    res.json({
      success: true,
      data: result.logs,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('❌ Error en /audit/logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener logs de auditoría',
      error: error.message
    });
  }
});

// Exportar reporte Excel con filtros
router.get('/export-excel', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    console.log('📊 Excel export route called');
    console.log('👤 User:', req.user);
    console.log('🔍 Query params:', req.query);
    
    const AuditService = (await import('../services/AuditService.js')).default;
    const auditService = new AuditService();

    const filters = {
      action: req.query.action,
      search: req.query.search,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      trainerId: req.query.trainerId,
      trainerName: req.query.trainerName,
      trainingId: req.query.trainingId
    };

    console.log('📊 Generating Excel with filters:', filters);
    const excelBuffer = await auditService.generateExcelReport(filters);

    const filename = `reporte-auditoria-${new Date().toISOString().slice(0,10)}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    console.log('📁 Sending Excel file:', filename);
    return res.send(excelBuffer);
  } catch (error) {
    console.error('❌ Error en /audit/export-excel:', error);
    res.status(500).json({ success: false, message: 'Error generando reporte Excel', error: error.message });
  }
});

// Exportar reporte (CSV) con filtros
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const AuditService = (await import('../services/AuditService.js')).default;
    const auditService = new AuditService();

    const filters = {
      action: req.query.action,
      search: req.query.search,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      trainerId: req.query.trainerId,
      trainerName: req.query.trainerName, // Nuevo: búsqueda por nombre
      trainingId: req.query.trainingId
    };

    const format = req.query.format || 'csv';
    const report = await auditService.generateReport(filters, format);

    if (format === 'csv') {
      const filename = `reporte-auditoria-${new Date().toISOString().slice(0,10)}.csv`;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(report);
    }

    res.json({ success: true, data: report });
  } catch (error) {
    console.error('❌ Error en /audit/export:', error);
    res.status(500).json({ success: false, message: 'Error generando reporte', error: error.message });
  }
});

router.get('/statistics', authMiddleware, async (req, res) => {
  try {
    const AuditService = (await import('../services/AuditService.js')).default;
    const auditService = new AuditService();
    
    const stats = await auditService.getStatistics();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error en /audit/statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

router.get('/actions', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const AuditLog = (await import('../models/AuditLog.js')).default;
    const actions = AuditLog.schema.paths.action.enumValues;
    
    res.json({
      success: true,
      data: actions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener acciones',
      error: error.message
    });
  }
});

// Ruta de prueba básica (con autenticación)
router.get('/test', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "Audit routes working",
    user: req.user?.email,
    timestamp: new Date()
  });
});

// Ruta de prueba para verificar datos en la base (con autenticación)
router.get('/test-logs', authMiddleware, async (req, res) => {
  try {
    const AuditLog = (await import('../models/AuditLog.js')).default;
    const count = await AuditLog.countDocuments();
    const logs = await AuditLog.find().limit(5).sort({ timestamp: -1 });
    
    res.json({
      success: true,
      count: count,
      data: logs.map(log => ({
        id: log._id,
        action: log.action,
        timestamp: log.timestamp,
        userId: log.userId,
        userSnapshot: log.userSnapshot
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

export default router;
// services/userDataService.js
import Usuario from '../models/Usuario.js';
import Course from '../models/Course.js';
import Level from '../models/Level.js'; // ← ¡FALTABA ESTA IMPORTACIÓN!
import UserProgress from '../models/UserProgress.js';
import PrivateMessage from '../models/PrivateMessage.js';
import Report from '../models/Report.js';

/**
 * Servicio para obtener datos completos del usuario
 * Incluye: información del usuario, cursos asignados, progreso, mensajes y reportes
 */
export const getUserCompleteData = async (userId) => {
  try {
    // Validar que el userId sea válido
    if (!userId) {
      throw new Error('ID de usuario requerido');
    }

    // Obtener usuario con cursos asignados poblados
    const user = await Usuario.findById(userId)
      .populate({
        path: 'cursosAsignados',
        select: 'title subtitle description image isActive totalLevels introduction levels createdBy asignadoA',
        populate: [
          {
            path: 'levels',
            select: 'levelNumber title description bibliography training evaluation isActive',
            model: Level // ← Especificar el modelo explícitamente
          },
          {
            path: 'createdBy',
            select: 'nombre apellidos email',
            model: Usuario
          },
          {
            path: 'asignadoA',
            select: 'nombre apellidos email',
            model: Usuario
          }
        ]
      })
      .exec();

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Obtener progreso del usuario en todos sus cursos
    const userProgress = await UserProgress.find({ userId })
      .populate({
        path: 'courseId',
        select: 'title',
        model: Course
      })
      .populate({
        path: 'completedLevels.levelId',
        select: 'levelNumber title',
        model: Level // ← Especificar el modelo
      })
      .exec();

    // Obtener mensajes privados del usuario (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const messages = await PrivateMessage.find({
      $or: [
        { sender: userId, folder: { $ne: 'trash' } },
        { recipient: userId, folder: { $ne: 'trash' } }
      ],
      createdAt: { $gte: thirtyDaysAgo }
    })
    .populate('sender', 'nombre apellidos email tipo', Usuario)
    .populate('recipient', 'nombre apellidos email tipo', Usuario)
    .populate('courseId', 'title', Course)
    .sort({ createdAt: -1 })
    .limit(50)
    .exec();

    // Obtener reportes del usuario (últimos 3 meses)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const reports = await Report.find({ 
      userId,
      createdAt: { $gte: threeMonthsAgo }
    })
    .populate('courseId', 'title', Course)
    .populate('levelId', 'levelNumber title', Level) // ← Especificar el modelo
    .sort({ createdAt: -1 })
    .exec();

    // Calcular estadísticas
    const cursosCompletados = userProgress.filter(p => p.isCompleted).length;
    const mensajesNoLeidos = messages.filter(m => 
      !m.isRead && m.recipient && m.recipient._id.toString() === userId
    ).length;

    // Estructurar la respuesta de manera eficiente
    const cursosFormateados = user.cursosAsignados.map(curso => ({
      _id: curso._id,
      title: curso.title,
      subtitle: curso.subtitle,
      description: curso.description,
      image: curso.image,
      isActive: curso.isActive,
      totalLevels: curso.totalLevels,
      introduction: curso.introduction,
      createdBy: curso.createdBy ? {
        _id: curso.createdBy._id,
        nombre: curso.createdBy.nombre,
        apellidos: curso.createdBy.apellidos,
        email: curso.createdBy.email
      } : null,
      asignadoA: curso.asignadoA.map(user => ({
        _id: user._id,
        nombre: user.nombre,
        apellidos: user.apellidos,
        email: user.email
      })),
      levels: curso.levels.map(level => ({
        _id: level._id,
        levelNumber: level.levelNumber,
        title: level.title,
        description: level.description,
        bibliography: level.bibliography,
        training: level.training,
        evaluation: level.evaluation,
        isActive: level.isActive
      }))
    }));

    const progresoFormateado = userProgress.map(progreso => ({
      _id: progreso._id,
      courseId: progreso.courseId ? {
        _id: progreso.courseId._id,
        title: progreso.courseId.title
      } : null,
      completedLevels: progreso.completedLevels.map(nivel => ({
        levelId: nivel.levelId ? {
          _id: nivel.levelId._id,
          levelNumber: nivel.levelId.levelNumber,
          title: nivel.levelId.title
        } : null,
        levelNumber: nivel.levelNumber,
        completedAt: nivel.completedAt,
        score: nivel.score,
        attempts: nivel.attempts
      })),
      currentLevel: progreso.currentLevel,
      totalProgress: progreso.totalProgress,
      lastActivity: progreso.lastActivity,
      startedAt: progreso.startedAt,
      completedAt: progreso.completedAt,
      isCompleted: progreso.isCompleted
    }));

    const mensajesFormateados = messages.map(mensaje => ({
      _id: mensaje._id,
      sender: mensaje.sender ? {
        _id: mensaje.sender._id,
        nombre: mensaje.sender.nombre,
        apellidos: mensaje.sender.apellidos,
        email: mensaje.sender.email,
        tipo: mensaje.sender.tipo
      } : null,
      recipient: mensaje.recipient ? {
        _id: mensaje.recipient._id,
        nombre: mensaje.recipient.nombre,
        apellidos: mensaje.recipient.apellidos,
        email: mensaje.recipient.email,
        tipo: mensaje.recipient.tipo
      } : null,
      courseId: mensaje.courseId ? {
        _id: mensaje.courseId._id,
        title: mensaje.courseId.title
      } : null,
      subject: mensaje.subject,
      message: mensaje.message,
      attachments: mensaje.attachments,
      status: mensaje.status,
      isRead: mensaje.isRead,
      folder: mensaje.folder,
      createdAt: mensaje.createdAt
    }));

    const reportesFormateados = reports.map(reporte => ({
      _id: reporte._id,
      courseId: reporte.courseId ? {
        _id: reporte.courseId._id,
        title: reporte.courseId.title
      } : null,
      levelId: reporte.levelId ? {
        _id: reporte.levelId._id,
        levelNumber: reporte.levelId.levelNumber,
        title: reporte.levelId.title
      } : null,
      levelNumber: reporte.levelNumber,
      score: reporte.score,
      errors: reporte.errors,
      errorVideos: reporte.errorVideos,
      comment: reporte.comment,
      attemptNumber: reporte.attemptNumber,
      status: reporte.status,
      timeSpent: reporte.timeSpent,
      createdAt: reporte.createdAt,
      completedAt: reporte.completedAt
    }));

    return {
      user: {
        _id: user._id,
        nombre: user.nombre,
        apellidos: user.apellidos,
        email: user.email,
        tipo: user.tipo,
        legajo: user.legajo,
        imagenPerfil: user.imagenPerfil,
        ultimoIngreso: user.ultimoIngreso
      },
      cursos: cursosFormateados,
      progreso: progresoFormateado,
      mensajes: {
        total: messages.length,
        noLeidos: mensajesNoLeidos,
        items: mensajesFormateados
      },
      reportes: reportesFormateados,
      estadisticas: {
        totalCursos: user.cursosAsignados.length,
        cursosCompletados: cursosCompletados,
        cursosEnProgreso: userProgress.length - cursosCompletados,
        totalMensajes: messages.length,
        mensajesNoLeidos: mensajesNoLeidos,
        totalReportes: reports.length,
        porcentajeCompletadoTotal: userProgress.length > 0 
          ? Math.round(userProgress.reduce((acc, curr) => acc + curr.totalProgress, 0) / userProgress.length)
          : 0
      },
      metadata: {
        ultimaActualizacion: new Date(),
        version: '1.0.0'
      }
    };

  } catch (error) {
    console.error('Error en getUserCompleteData:', error);
    throw new Error(`No se pudieron obtener los datos completos del usuario: ${error.message}`);
  }
};

export default {
  getUserCompleteData
};
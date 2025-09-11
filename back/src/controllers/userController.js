// Nuevo controlador desacoplado para usuario y datos completos
import UsuarioResponseFormatter from '../formatters/UsuarioResponseFormatter.js';
import CourseResponseFormatter from '../formatters/CourseResponseFormatter.js';
import ProgressResponseFormatter from '../formatters/ProgressResponseFormatter.js';
import MessageResponseFormatter from '../formatters/MessageResponseFormatter.js';
import ReportResponseFormatter from '../formatters/ReportResponseFormatter.js';
import AppError from '../middlewares/AppError.js';

// Importar modelos
import Usuario from '../models/Usuario.js';
import Course from '../models/Course.js';
import Level from '../models/Level.js';
import UserProgress from '../models/UserProgress.js';
import PrivateMessage from '../models/PrivateMessage.js';
import Report from '../models/Report.js';

// Importar servicios
import UserService from '../services/UserService.js';
import CourseService from '../services/CourseService.js';
import ProgressService from '../services/ProgressService.js';
import MessageService from '../services/MessageService.js';
import ReportService from '../services/ReportService.js';

// Instanciar servicios pasando los modelos
const userService = new UserService({ UsuarioModel: Usuario });
const courseService = new CourseService({ UsuarioModel: Usuario, LevelModel: Level });
const progressService = new ProgressService({ UserProgressModel: UserProgress, CourseModel: Course, LevelModel: Level });
const messageService = new MessageService({ PrivateMessageModel: PrivateMessage, UsuarioModel: Usuario, CourseModel: Course });
const reportService = new ReportService({ ReportModel: Report, CourseModel: Course, LevelModel: Level });

export const makeUserController = () => ({
  async getUserCompleteData(req, res, next) {
    try {
      const userId = req.params.id || req.user?.userId;
      if (!userId) throw new AppError('ID de usuario requerido', 400);

      // Obtener datos de cada servicio
      const user = await userService.getUserById(userId);
      if (!user) throw new AppError('Usuario no encontrado', 404);
      const cursos = await courseService.getCoursesForUser(userId);
      const progreso = await progressService.getProgressForUser(userId);
      const mensajes = await messageService.getMessagesForUser(userId);
      const reportes = await reportService.getReportsForUser(userId);

      // Formatear datos
      const userFormatted = UsuarioResponseFormatter.toPublic(user);
      const cursosFormatted = cursos.map(CourseResponseFormatter.format);
      const progresoFormatted = progreso.map(ProgressResponseFormatter.format);
      const mensajesFormatted = mensajes.map(MessageResponseFormatter.format);
      const reportesFormatted = reportes.map(ReportResponseFormatter.format);

      // Estadísticas
      const cursosCompletados = progresoFormatted.filter(p => p.isCompleted).length;
      const mensajesNoLeidos = mensajesFormatted.filter(m => !m.isRead && m.recipient && m.recipient._id === userId).length;

        console.log("DATOS SIN FORMATEAR: ", user)
        console.log(" ")
        console.log("DATOS FORMATEADOS: ", userFormatted)
      // Respuesta final
      res.json({
        user: userFormatted,
        cursos: cursosFormatted,
        progreso: progresoFormatted,
        mensajes: {
          total: mensajesFormatted.length,
          noLeidos: mensajesNoLeidos,
          items: mensajesFormatted
        },
        reportes: reportesFormatted,
        estadisticas: {
          totalCursos: cursosFormatted.length,
          cursosCompletados,
          cursosEnProgreso: progresoFormatted.length - cursosCompletados,
          totalMensajes: mensajesFormatted.length,
          mensajesNoLeidos,
          totalReportes: reportesFormatted.length,
          porcentajeCompletadoTotal: progresoFormatted.length > 0
            ? Math.round(progresoFormatted.reduce((acc, curr) => acc + curr.totalProgress, 0) / progresoFormatted.length)
            : 0
        },
        metadata: {
          ultimaActualizacion: new Date(),
          version: '1.0.0'
        }
      });
    } catch (err) {
      next(err);
    }
  }
});

export default makeUserController;

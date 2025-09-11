// Servicio concreto para cursos
import { ICourseService } from '../interfaces/ICourseService.js';

export class CourseService extends ICourseService {
  constructor({ UsuarioModel, LevelModel }) {
    super();
    this.Usuario = UsuarioModel;
    this.Level = LevelModel;
  }

  async getCoursesForUser(userId) {
    const user = await this.Usuario.findById(userId)
      .populate({
        path: 'cursosAsignados',
        select: 'title subtitle description image isActive totalLevels introduction levels createdBy asignadoA',
        populate: [
          { path: 'levels', select: 'levelNumber title description bibliography training evaluation isActive', model: this.Level },
          { path: 'createdBy', select: 'nombre apellidos email', model: this.Usuario },
          { path: 'asignadoA', select: 'nombre apellidos email', model: this.Usuario }
        ]
      })
      .exec();
    return user ? user.cursosAsignados : [];
  }
}

export default CourseService;

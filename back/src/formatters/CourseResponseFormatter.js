// Formatter para cursos
import { ICurso } from '../interfaces/ICurso.js';

export class CourseResponseFormatter {
  static format(curso) {
    return {
      _id: curso._id,
      title: curso.title,
      subtitle: curso.subtitle,
      description: curso.description,
      image: curso.image,
      isActive: curso.isActive,
      totalLevels: curso.totalLevels,
      introduction: curso.introduction,
      createdBy: curso.createdBy,
      asignadoA: curso.asignadoA,
      levels: curso.levels
    };
  }
}

export default CourseResponseFormatter;

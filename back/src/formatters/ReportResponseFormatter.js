// Formatter para reportes
import { IReporte } from '../interfaces/IReporte.js';

export class ReportResponseFormatter {
  static format(reporte) {
    return {
      _id: reporte._id,
      courseId: reporte.courseId,
      levelId: reporte.levelId,
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
    };
  }
}

export default ReportResponseFormatter;

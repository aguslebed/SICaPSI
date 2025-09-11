// Formatter para progreso
import { IProgreso } from '../interfaces/IProgreso.js';

export class ProgressResponseFormatter {
  static format(progreso) {
    return {
      _id: progreso._id,
      courseId: progreso.courseId,
      completedLevels: progreso.completedLevels,
      currentLevel: progreso.currentLevel,
      totalProgress: progreso.totalProgress,
      lastActivity: progreso.lastActivity,
      startedAt: progreso.startedAt,
      completedAt: progreso.completedAt,
      isCompleted: progreso.isCompleted
    };
  }
}

export default ProgressResponseFormatter;

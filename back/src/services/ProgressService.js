// Servicio concreto para progreso
import { IProgressService } from '../interfaces/IProgressService.js';

export class ProgressService extends IProgressService {
  constructor({ UserProgressModel, CourseModel, LevelModel }) {
    super();
    this.UserProgress = UserProgressModel;
    this.Course = CourseModel;
    this.Level = LevelModel;
  }

  async getProgressForUser(userId) {
    return await this.UserProgress.find({ userId })
      .populate({ path: 'courseId', select: 'title', model: this.Course })
      .populate({ path: 'completedLevels.levelId', select: 'levelNumber title', model: this.Level })
      .exec();
  }
}

export default ProgressService;

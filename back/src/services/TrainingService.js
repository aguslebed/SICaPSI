// Servicio concreto para cursos
import { ITrainingService } from '../interfaces/ITrainingService.js';

export class TrainingService extends ITrainingService {
  constructor({ UserModel, LevelModel, TrainingModel }) {
    super();
    this.User = UserModel;
    this.Level = LevelModel;
    this.Training = TrainingModel;
  }

  async getCoursesForUser(userId) {
    const user = await this.User.findById(userId)
      .populate({
        path: 'assignedTraining',
        select: 'title subtitle description image isActive totalLevels introduction levels createdBy report progressPercentage',
        populate: [
          { path: 'levels', select: 'levelNumber title description bibliography training evaluation isActive', model: this.Level },
          { path: 'createdBy', select: 'firstName lastName email', model: this.User }
        ],
        model: this.Training
      })
      .exec();
    return user ? user.assignedTraining : [];
  }
}
 
export default TrainingService;

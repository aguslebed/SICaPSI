import {ILevelService}  from "../interfaces/ILevelService.js";
export class LevelService extends ILevelService{
  constructor({ LevelModel, UserModel, TrainingModel }) {
    super();
    this.user = UserModel;
    this.training = TrainingModel;
    this.levels = LevelModel;
  }

    async getAllLevelsInTraining(trainingId) {
    const training = await this.training.findById(trainingId);
    if (!training) {
      throw new Error("Capacitación no encontrada");
    }

    const levels = await this.levels.find({ trainingId: trainingId });
    return levels;
}



}
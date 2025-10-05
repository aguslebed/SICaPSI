import { ILevelService } from "../interfaces/ILevelService.js";
export class LevelService extends ILevelService {
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

    async addLevelToTraining(level) {
        const training = await this.training.findById(level.trainingId);
        if (!training) {
            throw new Error("Capacitación no encontrada");
        }

        const existingLevel = await this.levels.findOne({
            trainingId: level.trainingId,
            levelNumber: level.levelNumber
        });

        if (existingLevel) {
            throw new Error("El número de nivel ya existe en esta capacitación");
        }

        const newLevel = new this.levels(level);
        await newLevel.save(newLevel);
        return newLevel;

    }
}
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

    async addLevelsToTraining(trainingId, levels) {
        const training = await this.training.findById(trainingId);
        if (!training) {
            throw new Error("Capacitación no encontrada");
        }

        // Validar duplicados en la base de datos
        const levelNumbers = levels.map(lvl => lvl.levelNumber);
        const existingLevels = await this.levels.find({
            trainingId: trainingId,
            levelNumber: { $in: levelNumbers }
        });
        if (existingLevels.length > 0) {
            throw new Error("Uno o más números de nivel ya existen en esta capacitación");
        }

        // Crear los niveles
        const newLevels = await this.levels.insertMany(levels);
        return newLevels;
    }
}
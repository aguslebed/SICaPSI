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

    async updateLevelsInTraining(trainingId, levels) {
        const training = await this.training.findById(trainingId);
        if (!training) {
            throw new Error("Capacitación no encontrada");
        }
        // Para cada nivel, actualizar o crear si no existe
        const updatePromises = levels.map(async (level) => {
            // Si viene con _id, actualizamos por _id
            if (level._id) {
                return await this.levels.findByIdAndUpdate(
                    level._id,
                    level,
                    { new: true, runValidators: true }
                );
            }

            // Si no viene _id, intentamos localizar por trainingId + levelNumber
            if (typeof level.levelNumber === 'number') {
                const existing = await this.levels.findOne({ trainingId, levelNumber: level.levelNumber });
                if (existing) {
                    // Actualizar el documento existente para evitar duplicados
                    return await this.levels.findByIdAndUpdate(
                        existing._id,
                        { ...existing.toObject(), ...level },
                        { new: true, runValidators: true }
                    );
                }
            }

            // Si no existe, crear nuevo
            return await this.levels.create(level);
        });

        const updatedLevels = await Promise.all(updatePromises);
        return updatedLevels;
    }
}
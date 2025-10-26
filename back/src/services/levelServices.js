import { ILevelService } from "../interfaces/ILevelService.js";
import LevelRepository from "../repositories/LevelRepository.js";
import TrainingRepository from "../repositories/TrainingRepository.js";
import { 
    extractLevelNumbers, 
    hasDuplicates, 
    createDuplicateErrorMessage,
    determineLevelOperation,
    extractIds 
} from "../utils/LevelValidator.js";

export class LevelService extends ILevelService {
    /**
     * Constructor con inyección de dependencias
     * @param {Object} dependencies - Dependencias del servicio
     * @param {Object} dependencies.LevelModel - Modelo Level (para retrocompatibilidad)
     * @param {Object} dependencies.UserModel - Modelo User (para retrocompatibilidad)
     * @param {Object} dependencies.TrainingModel - Modelo Training (para retrocompatibilidad)
     * @param {LevelRepository} dependencies.levelRepo - Repositorio de niveles
     * @param {TrainingRepository} dependencies.trainingRepo - Repositorio de capacitaciones
     */
    constructor(dependencies = {}) {
        super();
        // Mantener retrocompatibilidad con modelos directos
        this.user = dependencies.UserModel;
        this.training = dependencies.TrainingModel;
        this.levels = dependencies.LevelModel;
        
        // DIP: Inyección de repositorios (con defaults para producción)
        this.levelRepo = dependencies.levelRepo || new LevelRepository();
        this.trainingRepo = dependencies.trainingRepo || new TrainingRepository();
    }

    async getAllLevelsInTraining(trainingId) {
        // Usar repositorio para verificar existencia
        const trainingExists = await this.trainingRepo.exists(trainingId);
        if (!trainingExists) {
            throw new Error("Capacitación no encontrada");
        }

        // Usar repositorio para obtener niveles
        const levels = await this.levelRepo.findByTrainingId(trainingId);
        return levels;
    }

    async addLevelsToTraining(trainingId, levels) {
        // Usar repositorio para verificar existencia
        const trainingExists = await this.trainingRepo.exists(trainingId);
        if (!trainingExists) {
            throw new Error("Capacitación no encontrada");
        }

        // Usar funciones puras para extraer números y validar duplicados
        const levelNumbers = extractLevelNumbers(levels);
        
        // Usar modelo directo para búsqueda de duplicados (usando Mongoose)
        const existingLevels = await this.levels.find({
            trainingId: trainingId,
            levelNumber: { $in: levelNumbers }
        });
        
        // Validar duplicados con función pura
        if (hasDuplicates(existingLevels)) {
            throw new Error(createDuplicateErrorMessage(existingLevels));
        }

        // Crear los niveles usando modelo directo (insertMany)
        const newLevels = await this.levels.insertMany(levels);
        
        // Usar repositorio para actualizar el training
        const newLevelIds = extractIds(newLevels);
        await this.trainingRepo.pushLevels(trainingId, newLevelIds);
        
        console.log(`✅ ${newLevels.length} niveles agregados al training ${trainingId}`);
        return newLevels;
    }

    async updateLevelsInTraining(trainingId, levels) {
        // Usar repositorio para verificar existencia
        const trainingExists = await this.trainingRepo.exists(trainingId);
        if (!trainingExists) {
            throw new Error("Capacitación no encontrada");
        }
        
        // Para cada nivel, actualizar o crear si no existe
        const updatePromises = levels.map(async (level) => {
            const operation = determineLevelOperation(level);
            
            // Si viene con _id, actualizamos por _id
            if (operation.hasId) {
                return await this.levels.findByIdAndUpdate(
                    level._id,
                    level,
                    { new: true, runValidators: true }
                );
            }

            // Si no viene _id, intentamos localizar por trainingId + levelNumber
            if (operation.hasLevelNumber) {
                const existing = await this.levelRepo.findByTrainingAndNumber(trainingId, level.levelNumber);
                if (existing) {
                    // Actualizar el documento existente para evitar duplicados
                    return await this.levels.findByIdAndUpdate(
                        existing._id,
                        { ...existing, ...level },
                        { new: true, runValidators: true }
                    );
                }
            }

            // Si no existe, crear nuevo
            return await this.levels.create(level);
        });

        const updatedLevels = await Promise.all(updatePromises);
        
        // Usar repositorio para actualizar el array de levels en el Training
        const allLevelIds = extractIds(updatedLevels);
        await this.trainingRepo.setLevels(trainingId, allLevelIds);
        
        console.log(`✅ ${updatedLevels.length} niveles actualizados en training ${trainingId}`);
        return updatedLevels;
    }
}
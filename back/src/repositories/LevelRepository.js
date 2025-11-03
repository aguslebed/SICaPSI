/**
 * LevelRepository - Abstracción para acceso a datos de Level
 * Cumple con DIP: ProgressService depende de esta abstracción, no directamente de Mongoose
 */
import Level from "../models/Level.js";

class LevelRepository {
  /**
   * Busca un nivel por ID
   * @param {string|ObjectId} id - ID del nivel
   * @returns {Promise<Object|null>} Nivel encontrado o null
   */
  async findById(id) {
    return Level.findById(id).lean();
  }

  /**
   * Busca niveles por trainingId
   * @param {string|ObjectId} trainingId - ID de la capacitación
   * @returns {Promise<Array>} Array de niveles
   */
  async findByTrainingId(trainingId) {
    return Level.find({ trainingId }).sort({ levelNumber: 1 }).lean();
  }

  /**
   * Busca un nivel por trainingId y levelNumber
   * @param {string|ObjectId} trainingId - ID de la capacitación
   * @param {number} levelNumber - Número del nivel
   * @returns {Promise<Object|null>} Nivel encontrado o null
   */
  async findByTrainingAndNumber(trainingId, levelNumber) {
    return Level.findOne({ trainingId, levelNumber }).lean();
  }

  /**
   * Busca un nivel por trainingId y title
   * @param {string|ObjectId} trainingId - ID de la capacitación
   * @param {string} title - Título del nivel
   * @returns {Promise<Object|null>} Nivel encontrado o null
   */
  async findByTrainingAndTitle(trainingId, title) {
    return Level.findOne({ trainingId, title }).lean();
  }

  /**
   * Cuenta niveles de una capacitación
   * @param {string|ObjectId} trainingId - ID de la capacitación
   * @returns {Promise<number>} Cantidad de niveles
   */
  async countByTrainingId(trainingId) {
    return Level.countDocuments({ trainingId });
  }

  /**
   * Agregación: total de niveles por capacitación
   * @returns {Promise<Array>} Array con { _id: trainingId, totalLevels }
   */
  async aggregateTotalsByTraining() {
    return Level.aggregate([
      { $group: { _id: "$trainingId", totalLevels: { $sum: 1 } } }
    ]);
  }

  /**
   * Agregación: total de niveles por múltiples capacitaciones
   * @param {Array} trainingIds - Array de IDs de capacitaciones
   * @returns {Promise<Array>} Array con { _id: trainingId, totalLevels }
   */
  async aggregateTotalsByTrainings(trainingIds) {
    return Level.aggregate([
      { $match: { trainingId: { $in: trainingIds } } },
      { $group: { _id: "$trainingId", totalLevels: { $sum: 1 } } }
    ]);
  }
}

export default LevelRepository;

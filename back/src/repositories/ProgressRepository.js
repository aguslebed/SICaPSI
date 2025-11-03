/**
 * ProgressRepository - Abstracción para acceso a datos de UserLevelProgress
 * Cumple con DIP: ProgressService depende de esta abstracción, no directamente de Mongoose
 */
import UserLevelProgress from "../models/UserLevelProgress.js";

class ProgressRepository {
  /**
   * Crea un nuevo registro de progreso
   * @param {Object} data - Datos del progreso
   * @returns {Promise<Object>} Registro creado
   */
  async create(data) {
    return UserLevelProgress.create(data);
  }

  /**
   * Busca registros de progreso por userId y levelId
   * @param {string|ObjectId} userId - ID del usuario
   * @param {string|ObjectId} levelId - ID del nivel
   * @returns {Promise<Array>} Array de registros
   */
  async findByUserAndLevel(userId, levelId) {
    return UserLevelProgress.find({ userId, levelId })
      .sort({ percentage: -1, earnedPoints: -1 })
      .lean();
  }

  /**
   * Busca registros de progreso por userId y trainingId
   * @param {string|ObjectId} userId - ID del usuario
   * @param {string|ObjectId} trainingId - ID de la capacitación
   * @returns {Promise<Array>} Array de registros
   */
  async findByUserAndTraining(userId, trainingId) {
    return UserLevelProgress.find({ userId, trainingId }).lean();
  }

  /**
   * Busca registros completados por trainingId y levelId
   * @param {string|ObjectId} trainingId - ID de la capacitación
   * @param {string|ObjectId} levelId - ID del nivel
   * @returns {Promise<Array>} Array de registros
   */
  async findCompletedByTrainingAndLevel(trainingId, levelId) {
    return UserLevelProgress.find({
      trainingId,
      levelId,
      completed: true
    }).lean();
  }

  /**
   * Busca registros completados recientes con populate de usuario
   * @param {string|ObjectId} trainingId - ID de la capacitación
   * @param {string|ObjectId} levelId - ID del nivel
   * @param {number} limit - Límite de registros (por defecto 10)
   * @returns {Promise<Array>} Array de registros
   */
  async findRecentCompletedWithUser(trainingId, levelId, limit = 10) {
    return UserLevelProgress.find({
      trainingId,
      levelId,
      completed: true
    })
      .sort({ completedAt: -1 })
      .limit(limit)
      .populate('userId', 'firstName lastName email')
      .lean();
  }

  /**
   * Cuenta registros de progreso completados y aprobados
   * @param {string|ObjectId} userId - ID del usuario
   * @param {string|ObjectId} trainingId - ID de la capacitación
   * @returns {Promise<number>} Cantidad de niveles completados
   */
  async countCompletedAndApproved(userId, trainingId) {
    return UserLevelProgress.countDocuments({
      userId,
      trainingId,
      completed: true,
      approved: true
    });
  }

  /**
   * Elimina registros de progreso por userId y levelId
   * @param {string|ObjectId} userId - ID del usuario
   * @param {string|ObjectId} levelId - ID del nivel
   * @returns {Promise<Object>} Resultado de la operación
   */
  async deleteByUserAndLevel(userId, levelId) {
    return UserLevelProgress.deleteMany({ userId, levelId });
  }

  /**
   * Agregación: niveles completados por usuario y capacitación
   * @param {string|ObjectId} userId - ID del usuario
   * @param {Array} trainingIds - Array de IDs de capacitaciones
   * @returns {Promise<Array>} Array con { _id: trainingId, levelsCompleted }
   */
  async aggregateCompletedByUserAndTrainings(userId, trainingIds) {
    return UserLevelProgress.aggregate([
      { $match: { userId, completed: true, approved: true, trainingId: { $in: trainingIds } } },
      { $group: { _id: "$trainingId", levelsCompleted: { $sum: 1 } } }
    ]);
  }

  /**
   * Agregación: niveles completados por usuario agrupados por capacitación
   * @param {string|ObjectId} trainingId - ID de la capacitación
   * @returns {Promise<Array>} Array con { _id: userId, levelsCompleted }
   */
  async aggregateCompletedByTraining(trainingId) {
    return UserLevelProgress.aggregate([
      { $match: { trainingId, completed: true, approved: true } },
      { $group: { _id: "$userId", levelsCompleted: { $sum: 1 } } }
    ]);
  }

  /**
   * Agregación: progreso global por capacitación
   * @returns {Promise<Array>} Array con { _id: trainingId, totalUsers, totalLevelsCompleted }
   */
  async aggregateGlobalProgress() {
    return UserLevelProgress.aggregate([
      { $match: { completed: true, approved: true } },
      { $group: { _id: { trainingId: "$trainingId", userId: "$userId" }, levelsCompleted: { $sum: 1 } } },
      { $group: { _id: "$_id.trainingId", totalUsers: { $sum: 1 }, totalLevelsCompleted: { $sum: "$levelsCompleted" } } }
    ]);
  }
}

export default ProgressRepository;

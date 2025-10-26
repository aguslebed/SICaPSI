/**
 * TrainingRepository - Abstracción para acceso a datos de Training
 * Cumple con DIP: LevelService depende de esta abstracción, no directamente de Mongoose
 */
import Training from "../models/Training.js";

class TrainingRepository {
  /**
   * Busca una capacitación por ID
   * @param {string|ObjectId} id - ID de la capacitación
   * @returns {Promise<Object|null>} Capacitación encontrada o null
   */
  async findById(id) {
    return Training.findById(id).lean();
  }

  /**
   * Actualiza una capacitación por ID
   * @param {string|ObjectId} id - ID de la capacitación
   * @param {Object} updateData - Datos a actualizar
   * @param {Object} options - Opciones de actualización
   * @returns {Promise<Object|null>} Capacitación actualizada o null
   */
  async findByIdAndUpdate(id, updateData, options = {}) {
    return Training.findByIdAndUpdate(id, updateData, options);
  }

  /**
   * Agrega IDs de niveles al array levels de una capacitación
   * @param {string|ObjectId} trainingId - ID de la capacitación
   * @param {Array} levelIds - Array de IDs de niveles a agregar
   * @returns {Promise<Object|null>} Capacitación actualizada o null
   */
  async pushLevels(trainingId, levelIds) {
    return Training.findByIdAndUpdate(
      trainingId,
      { $push: { levels: { $each: levelIds } } },
      { new: true }
    );
  }

  /**
   * Reemplaza el array de levels en una capacitación
   * @param {string|ObjectId} trainingId - ID de la capacitación
   * @param {Array} levelIds - Array de IDs de niveles
   * @returns {Promise<Object|null>} Capacitación actualizada o null
   */
  async setLevels(trainingId, levelIds) {
    return Training.findByIdAndUpdate(
      trainingId,
      { levels: levelIds },
      { new: true }
    );
  }

  /**
   * Verifica si existe una capacitación por ID
   * @param {string|ObjectId} id - ID de la capacitación
   * @returns {Promise<boolean>} true si existe, false si no
   */
  async exists(id) {
    const training = await Training.findById(id).select('_id').lean();
    return !!training;
  }
}

export default TrainingRepository;

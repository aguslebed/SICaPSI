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

  /**
   * Crea una nueva capacitación
   * @param {Object} trainingData - Datos de la capacitación
   * @returns {Promise<Object>} Capacitación creada
   */
  async create(trainingData) {
    const newTraining = new Training(trainingData);
    return newTraining.save();
  }

  /**
   * Busca capacitaciones con filtros y populate
   * @param {Object} filter - Filtro de búsqueda
   * @param {Array} populateOptions - Opciones de populate
   * @param {Object} sortOptions - Opciones de ordenamiento
   * @returns {Promise<Array>} Array de capacitaciones
   */
  async findWithPopulate(filter = {}, populateOptions = [], sortOptions = {}) {
    let query = Training.find(filter);
    
    populateOptions.forEach(popOption => {
      query = query.populate(popOption);
    });
    
    if (Object.keys(sortOptions).length > 0) {
      query = query.sort(sortOptions);
    }
    
    return query.exec();
  }

  /**
   * Busca una capacitación por ID con populate
   * @param {string|ObjectId} id - ID de la capacitación
   * @param {Array} populateOptions - Opciones de populate
   * @returns {Promise<Object|null>} Capacitación encontrada o null
   */
  async findByIdWithPopulate(id, populateOptions = []) {
    let query = Training.findById(id);
    
    populateOptions.forEach(popOption => {
      query = query.populate(popOption);
    });
    
    return query.exec();
  }

  /**
   * Busca una capacitación por título
   * @param {string} title - Título de la capacitación
   * @returns {Promise<Object|null>} Capacitación encontrada o null
   */
  async findByTitle(title) {
    return Training.findOne({ title }).lean();
  }

  /**
   * Busca capacitación por título excluyendo un ID
   * @param {string} title - Título de la capacitación
   * @param {string|ObjectId} excludeId - ID a excluir
   * @returns {Promise<Object|null>} Capacitación encontrada o null
   */
  async findByTitleExcludingId(title, excludeId) {
    return Training.findOne({ 
      title, 
      _id: { $ne: excludeId } 
    }).lean();
  }

  /**
   * Busca capacitación por ID sin lean (para usar .save())
   * @param {string|ObjectId} id - ID de la capacitación
   * @returns {Promise<Object|null>} Documento de Mongoose
   */
  async findByIdDocument(id) {
    return Training.findById(id);
  }

  /**
   * Elimina una capacitación por ID
   * @param {string|ObjectId} id - ID de la capacitación
   * @returns {Promise<Object|null>} Capacitación eliminada
   */
  async deleteById(id) {
    return Training.findByIdAndDelete(id);
  }

  /**
   * Busca capacitación con select de campo específico
   * @param {string|ObjectId} id - ID de la capacitación
   * @param {string} selectFields - Campos a seleccionar
   * @returns {Promise<Object|null>} Capacitación con campos seleccionados
   */
  async findByIdWithSelect(id, selectFields) {
    return Training.findById(id).select(selectFields).lean();
  }
}

export default TrainingRepository;

/**
 * UserRepository - Abstracción para acceso a datos de User
 * Cumple con DIP: ProgressService depende de esta abstracción, no directamente de Mongoose
 */
import User from "../models/User.js";

class UserRepository {
  /**
   * Busca un usuario por ID
   * @param {string|ObjectId} id - ID del usuario
   * @param {string} selectFields - Campos a seleccionar (opcional)
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  async findById(id, selectFields = null) {
    const query = User.findById(id).lean();
    if (selectFields) {
      query.select(selectFields);
    }
    return query;
  }

  /**
   * Cuenta usuarios alumnos asignados a una capacitación
   * @param {string|ObjectId} trainingId - ID de la capacitación
   * @returns {Promise<number>} Cantidad de alumnos
   */
  async countStudentsByTraining(trainingId) {
    return User.countDocuments({ 
      role: "Alumno", 
      assignedTraining: trainingId 
    });
  }

  /**
   * Busca un usuario por ID con populate de trainings
   * @param {string|ObjectId} userId - ID del usuario
   * @param {Object} populateOptions - Opciones de populate
   * @returns {Promise<Object|null>} Usuario con trainings poblados
   */
  async findByIdWithTrainings(userId, populateOptions = {}) {
    return User.findById(userId)
      .populate(populateOptions)
      .exec();
  }

  /**
   * Busca un usuario por email
   * @param {string} email - Email del usuario
   * @param {string} selectFields - Campos a seleccionar (opcional)
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  async findByEmail(email, selectFields = null) {
    const query = User.findOne({ email });
    if (selectFields) {
      query.select(selectFields);
    }
    return query.lean();
  }

  /**
   * Busca un usuario por ID o email
   * @param {string} value - ID o email del usuario
   * @param {string} selectFields - Campos a seleccionar (opcional)
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  async findByIdOrEmail(value, selectFields = null) {
    const query = User.findOne({
      $or: [
        { _id: value },
        { email: value }
      ]
    });
    if (selectFields) {
      query.select(selectFields);
    }
    return query.lean();
  }

  /**
   * Busca un usuario por ID sin lean (para usar .save())
   * @param {string|ObjectId} userId - ID del usuario
   * @returns {Promise<Object|null>} Documento de Mongoose
   */
  async findByIdDocument(userId) {
    return User.findById(userId);
  }

  /**
   * Busca usuarios por rol y capacitación no asignada
   * @param {string} role - Rol del usuario
   * @param {string|ObjectId} trainingId - ID de la capacitación
   * @returns {Promise<Array>} Array de usuarios
   */
  async findByRoleNotEnrolled(role, trainingId) {
    return User.find({
      role,
      assignedTraining: { $ne: trainingId }
    }).exec();
  }

  /**
   * Busca usuarios por rol y capacitación asignada
   * @param {string} role - Rol del usuario
   * @param {string|ObjectId} trainingId - ID de la capacitación
   * @returns {Promise<Array>} Array de usuarios
   */
  async findByRoleEnrolled(role, trainingId) {
    return User.find({
      role,
      assignedTraining: trainingId
    }).exec();
  }
}

export default UserRepository;

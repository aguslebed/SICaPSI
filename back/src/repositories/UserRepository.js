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

  /**
   * Busca un usuario por email sin lean
   * @param {string} email - Email del usuario
   * @returns {Promise<Object|null>} Documento de Mongoose
   */
  async findByEmailDocument(email) {
    return User.findOne({ email });
  }

  /**
   * Busca un usuario por número de documento
   * @param {string} documentNumber - Número de documento
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  async findByDocumentNumber(documentNumber) {
    if (!documentNumber) {
      return null;
    }
    return User.findOne({ documentNumber });
  }

  /**
   * Crea un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Usuario creado
   */
  async create(userData) {
    const entity = new User(userData);
    return entity.save();
  }

  /**
   * Busca usuarios con filtro y ordenamiento
   * @param {Object} filter - Filtro de búsqueda
   * @param {Object} sortOptions - Opciones de ordenamiento
   * @returns {Promise<Array>} Array de usuarios
   */
  async findWithFilter(filter = {}, sortOptions = {}) {
    return User.find(filter).sort(sortOptions).exec();
  }

  /**
   * Busca usuarios por rol con populate
   * @param {string} role - Rol del usuario
   * @param {Object} populateOptions - Opciones de populate
   * @param {Object} sortOptions - Opciones de ordenamiento
   * @returns {Promise<Array>} Array de usuarios
   */
  async findByRoleWithPopulate(role, populateOptions = {}, sortOptions = {}) {
    return User.find({ role })
      .populate(populateOptions)
      .sort(sortOptions)
      .exec();
  }

  /**
   * Busca un usuario por ID y rol
   * @param {string|ObjectId} id - ID del usuario
   * @param {string} role - Rol del usuario
   * @param {Object} populateOptions - Opciones de populate
   * @returns {Promise<Object|null>} Usuario encontrado
   */
  async findByIdAndRole(id, role, populateOptions = {}) {
    return User.findOne({ _id: id, role })
      .populate(populateOptions)
      .exec();
  }

  /**
   * Actualiza el estado de un usuario por ID y rol
   * @param {string|ObjectId} id - ID del usuario
   * @param {string} role - Rol del usuario
   * @param {string} status - Nuevo estado
   * @param {Object} populateOptions - Opciones de populate
   * @returns {Promise<Object|null>} Usuario actualizado
   */
  async updateStatusByIdAndRole(id, role, status, populateOptions = {}) {
    return User.findOneAndUpdate(
      { _id: id, role },
      { status },
      { new: true }
    )
    .populate(populateOptions)
    .exec();
  }

  /**
   * Busca usuarios por rol y training con select
   * @param {string} role - Rol del usuario
   * @param {string|ObjectId} trainingId - ID del training
   * @param {string} selectFields - Campos a seleccionar
   * @param {Object} sortOptions - Opciones de ordenamiento
   * @returns {Promise<Array>} Array de usuarios
   */
  async findByRoleAndTraining(role, trainingId, selectFields = '', sortOptions = {}) {
    return User.find({
      role,
      assignedTraining: trainingId
    })
    .select(selectFields)
    .sort(sortOptions)
    .exec();
  }

  /**
   * Actualiza el campo lastLogin de un usuario
   * @param {string|ObjectId} userId - ID del usuario
   * @returns {Promise<Object|null>} Usuario actualizado
   */
  async updateLastLogin(userId) {
    return User.findByIdAndUpdate(
      userId,
      { lastLogin: new Date() },
      { new: true }
    ).exec();
  }

  /**
   * Elimina un usuario por ID
   * @param {string|ObjectId} id - ID del usuario
   * @returns {Promise<Object|null>} Usuario eliminado
   */
  async deleteById(id) {
    return User.findByIdAndDelete(id).exec();
  }

  /**
   * Busca usuarios cuyo ID esté en un array
   * @param {Array<string>} userIds - Array de IDs
   * @param {string} selectFields - Campos a seleccionar
   * @returns {Promise<Array>} Array de usuarios
   */
  async findByIds(userIds, selectFields = '') {
    const query = User.find({ _id: { $in: userIds } });
    if (selectFields) {
      query.select(selectFields);
    }
    return query.lean();
  }

  /**
   * Busca usuarios con trainings en común (assignedTraining)
   * @param {string|ObjectId} excludeUserId - ID a excluir
   * @param {string} role - Rol del usuario
   * @param {Array<string>} trainingIds - Array de IDs de trainings
   * @param {string} selectFields - Campos a seleccionar
   * @returns {Promise<Array>} Array de usuarios
   */
  async findByRoleWithCommonTrainings(excludeUserId, role, trainingIds, selectFields = '') {
    return User.find({
      _id: { $ne: excludeUserId },
      role,
      assignedTraining: { $in: trainingIds }
    })
    .select(selectFields)
    .lean();
  }
}

export default UserRepository;

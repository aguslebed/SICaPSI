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
}

export default UserRepository;

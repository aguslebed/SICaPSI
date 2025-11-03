/**
 * MessageRepository - Abstracción para acceso a datos de PrivateMessage
 * Cumple con DIP: MessageService depende de esta abstracción, no directamente de Mongoose
 */
import PrivateMessage from "../models/PrivateMessage.js";

class MessageRepository {
  /**
   * Busca un mensaje por ID
   * @param {string|ObjectId} id - ID del mensaje
   * @returns {Promise<Object|null>} Mensaje encontrado o null
   */
  async findById(id) {
    return PrivateMessage.findById(id);
  }

  /**
   * Busca mensajes para un usuario con filtros
   * @param {Object} filter - Filtro de búsqueda
   * @param {Array} populateOptions - Opciones de populate
   * @param {Object} sortOptions - Opciones de ordenamiento
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} Array de mensajes
   */
  async findWithPopulate(filter = {}, populateOptions = [], sortOptions = {}, limit = 0) {
    let query = PrivateMessage.find(filter);
    
    populateOptions.forEach(popOption => {
      query = query.populate(popOption);
    });
    
    if (Object.keys(sortOptions).length > 0) {
      query = query.sort(sortOptions);
    }
    
    if (limit > 0) {
      query = query.limit(limit);
    }
    
    return query.exec();
  }

  /**
   * Crea un nuevo mensaje
   * @param {Object} messageData - Datos del mensaje
   * @returns {Promise<Object>} Mensaje creado
   */
  async create(messageData) {
    return PrivateMessage.create(messageData);
  }

  /**
   * Crea múltiples mensajes
   * @param {Array<Object>} messagesData - Array de datos de mensajes
   * @returns {Promise<Array>} Array de mensajes creados
   */
  async createMany(messagesData) {
    return Promise.all(messagesData.map(data => this.create(data)));
  }

  /**
   * Actualiza un mensaje
   * @param {string|ObjectId} id - ID del mensaje
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object|null>} Mensaje actualizado
   */
  async updateById(id, updateData) {
    const msg = await PrivateMessage.findById(id);
    if (!msg) return null;
    
    Object.assign(msg, updateData);
    return msg.save();
  }

  /**
   * Elimina un mensaje por ID
   * @param {string|ObjectId} id - ID del mensaje
   * @returns {Promise<Object>} Resultado de eliminación
   */
  async deleteById(id) {
    return PrivateMessage.deleteOne({ _id: id });
  }

  /**
   * Busca un mensaje por ID y lo popula
   * @param {string|ObjectId} id - ID del mensaje
   * @param {Array} populateOptions - Opciones de populate
   * @returns {Promise<Object|null>} Mensaje con populate
   */
  async findByIdWithPopulate(id, populateOptions = []) {
    let query = PrivateMessage.findById(id);
    
    populateOptions.forEach(popOption => {
      query = query.populate(popOption);
    });
    
    return query.exec();
  }
}

export default MessageRepository;

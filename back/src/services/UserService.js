// Servicio concreto para usuario
import { IUserService } from '../interfaces/IUserService.js';
import UserRepository from '../repositories/UserRepository.js';
import TrainingRepository from '../repositories/TrainingRepository.js';
import {
  emailExists,
  unifyUsersByIdMultiple,
  objectIdsToStrings,
  filterTrainingScope,
  buildUserFilter,
  createEmailExistsError,
  createUserNotFoundError,
  createSenderNotFoundError,
  createInvalidPasswordError
} from '../utils/UserValidator.js';

export class UserService extends IUserService {
  /**
   * Constructor con inyección de dependencias
   * @param {Object} dependencies - Dependencias del servicio
   * @param {Object} dependencies.UserModel - Modelo User (para retrocompatibilidad)
   * @param {Object} dependencies.TrainingModel - Modelo Training (para retrocompatibilidad)
   * @param {UserRepository} dependencies.userRepo - Repositorio de usuarios
   * @param {TrainingRepository} dependencies.trainingRepo - Repositorio de capacitaciones
   */
  constructor(dependencies = {}) {
    super();
    // Mantener retrocompatibilidad con modelos directos
    this.User = dependencies.UserModel;
    this.Training = dependencies.TrainingModel;
    
    // DIP: Inyección de repositorios (con defaults para producción)
    this.userRepo = dependencies.userRepo || new UserRepository();
    this.trainingRepo = dependencies.trainingRepo || new TrainingRepository();
  }

  async getById(id) {
    return await this.userRepo.findById(id);
  }

  async create(data) {
    // Usar repositorio para verificar email duplicado
    const exists = await this.userRepo.findByEmailDocument(data.email);
    
    // Validar con función pura
    if (emailExists(exists)) {
      throw new Error(createEmailExistsError());
    }
    
    // Hash de contraseña si existe el campo
    if (data.password) {
      const bcrypt = await import('bcryptjs');
      data.password = await bcrypt.default.hash(data.password, 10);
    }
    
    // Usar repositorio para crear
    const userData = {
      ...data,
      role: data.role || "Alumno", // Por defecto todos los nuevos usuarios son Alumno
      ultimoIngreso: data.ultimoIngreso ?? null,
      legajo: data.legajo ?? null,
      imagenPerfil: data.imagenPerfil ?? null
    };
    
    return await this.userRepo.create(userData);
  }

  async list(query = {}) {
    // Usar función pura para construir filtro
    const filter = buildUserFilter(query);
    
    // Usar repositorio para buscar
    return await this.userRepo.findWithFilter(filter, { createdAt: -1 });
  }

  /**
   * Retorna destinatarios permitidos para redactar mensajes según cursos del remitente.
   * - Profesores: usuarios que figuran como createdBy de los trainings del remitente
   * - Compañeros: estudiantes que comparten al menos uno de esos trainings
   */
  async findRecipientsForCompose({ senderId, trainingId }) {
    // Usar repositorio para obtener sender
    const sender = await this.userRepo.findById(senderId, 'assignedTraining role');
    if (!sender) throw new Error(createSenderNotFoundError());

    // Usar funciones puras para transformar datos
    const assigned = objectIdsToStrings(sender.assignedTraining);
    const trainingScope = filterTrainingScope(assigned, trainingId);
    if (!trainingScope.length) {
      return [];
    }

    const selectFields = 'firstName lastName email role profileImage assignedTraining';
    const senderRole = (sender.role || '').toLowerCase();
    const filterOutAdmins = (user) => (user?.role || '').toLowerCase() !== 'administrador';
    const allowedForStudent = (user) => {
      const role = (user?.role || '').toLowerCase();
      return role === 'alumno' || role === 'capacitador';
    };

    // Estudiantes con trainings en común
    const classmates = await this.userRepo.findByRoleWithCommonTrainings(
      senderId,
      'Alumno',
      trainingScope,
      selectFields
    );

    if (senderRole === 'capacitador') {
      // Capacitadores solo pueden enviar a alumnos de sus capacitaciones
      return classmates.filter(filterOutAdmins);
    }

    // Capacitadores asignados a las mismas capacitaciones (para alumnos y otros roles)
    const trainers = await this.userRepo.findByRoleWithCommonTrainings(
      senderId,
      'Capacitador',
      trainingScope,
      selectFields
    );

    // Incluir, como respaldo, cualquier creador de la capacitación que también sea capacitador
    const createdByFallback = await this.Training.find({ _id: { $in: trainingScope } })
      .select('createdBy')
      .lean();

    const senderIdStr = senderId.toString();
    const fallbackTeacherIds = createdByFallback
      .map(t => t?.createdBy?.toString?.())
      .filter(id => id && id !== senderIdStr);

    const fallbackTeachers = fallbackTeacherIds.length
      ? await this.userRepo.findByIds(fallbackTeacherIds, selectFields)
      : [];

    const filteredFallbackTeachers = fallbackTeachers.filter(u => (u?.role || '').toLowerCase() === 'capacitador');

    const combined = unifyUsersByIdMultiple(trainers, filteredFallbackTeachers, classmates);

    if (senderRole === 'alumno') {
      return combined.filter(user => filterOutAdmins(user) && allowedForStudent(user));
    }

    // Otros roles mantienen la misma lista combinada
    return combined;
  }

  async update(id, patch) {
    if (patch.password) {
      const bcrypt = await import('bcryptjs');
      patch.password = await bcrypt.default.hash(patch.password, 10);
    }
    
    // Usar repositorio para actualizar
    const updated = await this.User.findByIdAndUpdate(id, patch, { new: true }).exec();
    
    if (!updated) {
      throw new Error(createUserNotFoundError());
    }
    return updated;
  }

  async changePassword(userId, currentPassword, newPassword) {
    // Usar repositorio para obtener usuario
    const user = await this.userRepo.findByIdDocument(userId);
    if (!user) throw new Error(createUserNotFoundError());
    
    const bcrypt = (await import('bcryptjs')).default;
    const ok = await bcrypt.compare(currentPassword, user.password);
    
    // Validar con función pura (indirectamente)
    if (!ok) throw new Error(createInvalidPasswordError());
    
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return user;
  }

  /**
   * CAMBIO: Método agregado para obtener todos los profesores/trainers del sistema
   * Respeta SRP: Solo se encarga de obtener profesores desde la base de datos
   * Respeta OCP: Extiende funcionalidad sin modificar métodos existentes
   */
  async getTeachers() {
    // Usar repositorio con populate
    return await this.userRepo.findByRoleWithPopulate(
      'Capacitador',
      { path: 'assignedTraining', select: 'title subtitle' },
      { createdAt: -1 }
    );
  }

  /**
   * CAMBIO: Método agregado para obtener un profesor específico por ID
   * Respeta SRP: Solo obtiene datos de un profesor específico
   */
  async getTeacherById(id) {
    // Usar repositorio con filtro de rol
    return await this.userRepo.findByIdAndRole(
      id,
      'Capacitador',
      { path: 'assignedTraining', select: 'title subtitle' }
    );
  }

  /**
   * CAMBIO: Método agregado para actualizar el estado de un profesor
   * Respeta SRP: Solo maneja el cambio de estado en la base de datos
   * Respeta ISP: Método específico para una tarea específica
   */
  async updateTeacherStatus(id, status) {
    // Usar repositorio con actualización por rol
    return await this.userRepo.updateStatusByIdAndRole(
      id,
      'Capacitador',
      status,
      { path: 'assignedTraining', select: 'title subtitle' }
    );
  }

  /**
   * Obtener guardias inscritos en una capacitación específica
   */
  async getEnrolledStudents(trainingId) {
    // Usar repositorio con filtros específicos
    return await this.userRepo.findByRoleAndTraining(
      "Alumno",
      trainingId,
      'firstName lastName email documentNumber status',
      { firstName: 1, lastName: 1 }
    );
  }

  async delete(id) {
    // Verificar existencia con repositorio
    const user = await this.userRepo.findById(id);
    if (!user) return null;
    
    // Usar repositorio para eliminar
    return await this.userRepo.deleteById(id);
  }

  /**
   * Actualiza el último login del usuario con la fecha/hora actual
   */
  async updateLastLogin(userId) {
    // Usar repositorio para actualizar
    const updated = await this.userRepo.updateLastLogin(userId);
    console.log(updated, " -- updated lastLogin -- ");
    return updated;
  }
}

export default UserService;

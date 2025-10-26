import { IEnrollmentService } from "../interfaces/IEnrollmentService.js";
import UserRepository from "../repositories/UserRepository.js";
import TrainingRepository from "../repositories/TrainingRepository.js";
import {
  isAlreadyEnrolled,
  isNotEnrolled,
  removeTrainingFromList,
  isTrainer,
  hasUsers,
  createUserNotFoundError,
  createStudentNotFoundError,
  createTrainingNotFoundError,
  createAlreadyEnrolledError,
  createTrainerAlreadyEnrolledError,
  createNotEnrolledError,
  createInvalidRoleError,
  createNoUsersEnrolledError,
  createEnrollmentSuccessMessage,
  createUnenrollmentSuccessMessage
} from "../utils/EnrollmentValidator.js";

export class EnrollmentService extends IEnrollmentService {
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
    this.user = dependencies.UserModel;
    this.training = dependencies.TrainingModel;
    
    // DIP: Inyección de repositorios (con defaults para producción)
    this.userRepo = dependencies.userRepo || new UserRepository();
    this.trainingRepo = dependencies.trainingRepo || new TrainingRepository();
  }
 //Inscribir alumno en la capacitacion
  async enrollUserToTraining(userId, trainingId) {
    // Usar repositorio para obtener usuario (documento para .save())
    const user = await this.userRepo.findByIdDocument(userId);
    
    if (!user) throw new Error(createStudentNotFoundError());

    // Verificar existencia de capacitación
    const trainingExists = await this.trainingRepo.exists(trainingId);
    if (!trainingExists) throw new Error(createTrainingNotFoundError());

    // Validar con función pura
    if (isAlreadyEnrolled(user.assignedTraining, trainingId)) {
      throw new Error(createAlreadyEnrolledError());
    }

    user.assignedTraining.push(trainingId);
    await user.save();

    // Obtener training para respuesta
    const training = await this.trainingRepo.findById(trainingId);
    return { message: createEnrollmentSuccessMessage(), training };
  }

 //Desinscribir alumno de capacitacion
  async unenrollUserToTraining(userId, trainingId) {
    // Usar repositorio para obtener usuario (documento para .save())
    const user = await this.userRepo.findByIdDocument(userId);

    if (!user) throw new Error(createStudentNotFoundError());

    // Verificar existencia de capacitación
    const trainingExists = await this.trainingRepo.exists(trainingId);
    if (!trainingExists) throw new Error(createTrainingNotFoundError());

    // Validar con función pura
    if (isNotEnrolled(user.assignedTraining, trainingId)) {
      throw new Error(createNotEnrolledError());
    }

    // Usar función pura para filtrar
    user.assignedTraining = removeTrainingFromList(user.assignedTraining, trainingId);
    await user.save();

    // Obtener training para respuesta
    const training = await this.trainingRepo.findById(trainingId);
    return { message: createUnenrollmentSuccessMessage(), training };
  }

  //Devuelve todos los alumnos que NO estan anotados en una capacitacion
  async getUsersNotEnrolledInTraining(trainingId) {
    // Usar repositorio con filtro de rol y capacitación
    const users = await this.userRepo.findByRoleNotEnrolled("Alumno", trainingId);
    return users;
  }


  //Busca si un usuario esta inscrito en una capacitacion. (Podria ser estudiante o capacitador)
  async getUserEnrollments(userId) {
    // Usar repositorio con populate de trainings
    const user = await this.userRepo.findByIdWithTrainings(userId, {
      path: 'assignedTraining'
    });
    
    if (!user) throw new Error(createUserNotFoundError());
    
    return user.assignedTraining;
  }

  //Devuelve todos los alumnos que estan anotados en una capacitacion
  async getUsersEnrolledInTraining(trainingId) {
    // Verificar existencia de capacitación
    const trainingExists = await this.trainingRepo.exists(trainingId);
    if (!trainingExists) throw new Error(createTrainingNotFoundError());
    
    // Usar repositorio para buscar usuarios inscritos
    const users = await this.userRepo.findByRoleEnrolled("Alumno", trainingId);

    // Validar con función pura
    if (!hasUsers(users)) {
      throw new Error(createNoUsersEnrolledError());
    }

    return users;
  }

  //Inscribir capacitador en la capacitacion
  async enrollTrainerToTraining(userId, trainingId) {
    // Usar repositorio para obtener usuario (documento para .save())
    const user = await this.userRepo.findByIdDocument(userId);

    if (!user) throw new Error(createUserNotFoundError());

    // Verificar existencia de capacitación
    const trainingExists = await this.trainingRepo.exists(trainingId);
    if (!trainingExists) throw new Error(createTrainingNotFoundError());

    // Validar rol con función pura
    if (!isTrainer(user.role)) {
      throw new Error(createInvalidRoleError());
    }

    // Validar inscripción previa con función pura
    if (isAlreadyEnrolled(user.assignedTraining, trainingId)) {
      throw new Error(createTrainerAlreadyEnrolledError());
    }

    user.assignedTraining.push(trainingId);
    await user.save();

    // Obtener training para respuesta
    const training = await this.trainingRepo.findById(trainingId);
    return { message: createEnrollmentSuccessMessage(), training };
  }


  //Devuelve todos los capacitadores que NO estan anotados en una capacitacion en especifico
  async getTrainersNotEnrolledInTraining(trainingId) {
    // Usar repositorio con filtro de rol y capacitación
    const users = await this.userRepo.findByRoleNotEnrolled("Capacitador", trainingId);
    return users;
  }
}
// Servicio concreto para cursos
import { ITrainingService } from '../interfaces/ITrainingService.js';
import mongoose from 'mongoose';
import TrainingRepository from '../repositories/TrainingRepository.js';
import UserRepository from '../repositories/UserRepository.js';
import LevelRepository from '../repositories/LevelRepository.js';
import {
  titleExists,
  isValidObjectId,
  createDuplicateTitleError,
  createDuplicateTitleOnUpdateError,
  createTrainingNotFoundError,
  createGetTrainerError,
  determineUserSearchStrategy
} from '../utils/TrainingValidator.js';

export class TrainingService extends ITrainingService {
  /**
   * Constructor con inyección de dependencias
   * @param {Object} dependencies - Dependencias del servicio
   * @param {Object} dependencies.UserModel - Modelo User (para retrocompatibilidad)
   * @param {Object} dependencies.LevelModel - Modelo Level (para retrocompatibilidad)
   * @param {Object} dependencies.TrainingModel - Modelo Training (para retrocompatibilidad)
   * @param {TrainingRepository} dependencies.trainingRepo - Repositorio de capacitaciones
   * @param {UserRepository} dependencies.userRepo - Repositorio de usuarios
   * @param {LevelRepository} dependencies.levelRepo - Repositorio de niveles
   */
  constructor(dependencies = {}) {
    super();
    // Mantener retrocompatibilidad con modelos directos
    this.User = dependencies.UserModel;
    this.Level = dependencies.LevelModel;
    this.Training = dependencies.TrainingModel;
    
    // DIP: Inyección de repositorios (con defaults para producción)
    this.trainingRepo = dependencies.trainingRepo || new TrainingRepository();
    this.userRepo = dependencies.userRepo || new UserRepository();
    this.levelRepo = dependencies.levelRepo || new LevelRepository();
  }

  async getCoursesForUser(userId) {
    // Configurar opciones de populate
    const populateOptions = {
      path: 'assignedTraining',
      select: 'title subtitle description image isActive totalLevels levels createdBy rejectedBy rejectionReason pendingApproval report progressPercentage startDate endDate',
      populate: [
        { path: 'levels', select: 'levelNumber title description bibliography training test isActive', model: this.Level },
        { path: 'createdBy', select: 'firstName lastName email', model: this.User },
        { path: 'rejectedBy', select: 'firstName lastName email', model: this.User }
      ],
      model: this.Training
    };

    // Usar repositorio para obtener usuario con trainings poblados
    const user = await this.userRepo.findByIdWithTrainings(userId, populateOptions);
    return user ? user.assignedTraining : [];
  }


  //Esta funcion crea una capacitacion nueva
  async createTraining(trainingData) {
    // Usar repositorio para verificar título duplicado
    const training = await this.trainingRepo.findByTitle(trainingData.title);

    // Validar con función pura
    if (titleExists(training)) {
      throw new Error(createDuplicateTitleError());
    }

    // Convertir fechas de formato DD/MM/YYYY a formato ISO
    const dataToSave = { ...trainingData };
    
    if (dataToSave.startDate && typeof dataToSave.startDate === 'string') {
      const [day, month, year] = dataToSave.startDate.split('/');
      if (day && month && year) {
        dataToSave.startDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
      }
    }
    
    if (dataToSave.endDate && typeof dataToSave.endDate === 'string') {
      const [day, month, year] = dataToSave.endDate.split('/');
      if (day && month && year) {
        dataToSave.endDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
      }
    }

    // Usar repositorio para crear
    const newTraining = await this.trainingRepo.create(dataToSave);
    return newTraining;
  }

 //Devuelve todos las capacitaciones activas
 async getAllActiveTrainings() {
   // Configurar opciones de populate
   const populateOptions = [
     { path: 'createdBy', select: 'firstName lastName email', model: this.User },
     { path: 'rejectedBy', select: 'firstName lastName email', model: this.User },
     { path: 'levels', select: 'levelNumber title description bibliography training test isActive', model: this.Level }
   ];

   // Usar repositorio para buscar con filtro y populate
   const trainings = await this.trainingRepo.findWithPopulate(
     { isActive: true },
     populateOptions
   );
   return trainings;
 }

 //Devuelve TODAS las capacitaciones (activas e inactivas)
 async getAllTrainings() {
   // Configurar opciones de populate
   const populateOptions = [
     { path: 'createdBy', select: 'firstName lastName email', model: this.User },
     { path: 'rejectedBy', select: 'firstName lastName email', model: this.User },
     { path: 'levels', select: 'levelNumber title description bibliography training test isActive', model: this.Level }
   ];

   // Usar repositorio para buscar con populate y ordenar
   const trainings = await this.trainingRepo.findWithPopulate(
     {},
     populateOptions,
     { createdAt: -1 } // Más recientes primero
   );
   return trainings;
 }

 // Devuelve capacitaciones pendientes de aprobación
 async getPendingContent() {
   // Configurar opciones de populate
   const populateOptions = [
     { path: 'createdBy', select: 'firstName lastName email', model: this.User },
     { path: 'rejectedBy', select: 'firstName lastName email', model: this.User },
     { path: 'levels', select: 'levelNumber title description bibliography training test isActive', model: this.Level }
   ];

   // Usar repositorio para buscar con filtro, populate y ordenar
   const trainings = await this.trainingRepo.findWithPopulate(
     { pendingApproval: true },
     populateOptions,
     { createdAt: -1 } // Más recientes primero
   );
   return trainings;
 }

 // Obtener una capacitación por ID
 async getTrainingById(trainingId) {
   // Configurar opciones de populate
   const populateOptions = [
     { path: 'createdBy', select: 'firstName lastName email', model: this.User },
     { path: 'rejectedBy', select: 'firstName lastName email', model: this.User },
     { 
       path: 'levels', 
       select: 'levelNumber title description bibliography training test isActive', 
       model: this.Level 
     }
   ];

   // Usar repositorio para buscar con populate
   const training = await this.trainingRepo.findByIdWithPopulate(trainingId, populateOptions);
   return training;
 }

/**
 * Devuelve el usuario que actúa como profesor de la capacitación (assignedTeacher) dado un trainingId.
 * Compatible con assignedTeacher guardado como ObjectId o como string (por ejemplo, email).
 * @param {String} trainingId
 * @returns {Object|null} Usuario (campos públicos) o null si no existe
 */
async getTrainerByTrainingId(trainingId) {
  try {
    // Usar repositorio para buscar el campo assignedTeacher
    const training = await this.trainingRepo.findByIdWithSelect(trainingId, 'assignedTeacher');

    if (!training || !training.assignedTeacher) return null;

    const assignedValue = training.assignedTeacher;

    // Determinar estrategia de búsqueda con función pura
    const strategy = determineUserSearchStrategy(assignedValue);

    let trainer = null;
    const selectFields = 'firstName lastName email phone profileImage role';

    if (strategy.searchById && isValidObjectId(assignedValue)) {
      // Buscar por ObjectId
      trainer = await this.userRepo.findById(assignedValue, selectFields);
    }

    // Si no lo encontró por ID o no era un ObjectId válido, buscar por email o ambos
    if (!trainer) {
      trainer = await this.userRepo.findByIdOrEmail(assignedValue, selectFields);
    }

    return trainer || null;
  } catch (error) {
    console.error('❌ Error en getTrainerByTrainingId:', error);
    throw new Error(createGetTrainerError());
  }
}


 // Actualizar una capacitación
 async updateTraining(trainingId, trainingData) {
   console.log('🔄 Actualizando training:', { trainingId, title: trainingData.title });
   
   // Verificar si existe otra capacitación con el mismo título (si se está cambiando)
   if (trainingData.title) {
     const existingTraining = await this.trainingRepo.findByTitleExcludingId(
       trainingData.title,
       trainingId
     );
     
     console.log('🔍 Búsqueda de duplicados:', { 
       title: trainingData.title, 
       excludingId: trainingId,
       found: existingTraining ? existingTraining._id : null 
     });
     
     // Validar con función pura
     if (titleExists(existingTraining)) {
       console.log('❌ Título duplicado encontrado');
       throw new Error(createDuplicateTitleOnUpdateError());
     }
   }

   // Convertir fechas de formato DD/MM/YYYY a formato ISO
   const dataToUpdate = { ...trainingData };
   
   if (dataToUpdate.startDate && typeof dataToUpdate.startDate === 'string') {
     const [day, month, year] = dataToUpdate.startDate.split('/');
     if (day && month && year) {
       dataToUpdate.startDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
     }
   }
   
   if (dataToUpdate.endDate && typeof dataToUpdate.endDate === 'string') {
     const [day, month, year] = dataToUpdate.endDate.split('/');
     if (day && month && year) {
       dataToUpdate.endDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
     }
   }

   // Obtener la capacitación actual (documento Mongoose, no lean)
   const training = await this.trainingRepo.findByIdDocument(trainingId);
   
   if (!training) {
     throw new Error(createTrainingNotFoundError());
   }

   // Actualizar campos
   Object.assign(training, dataToUpdate);
   
   // Guardar (esto ejecutará el middleware pre-save que actualiza isActive según fechas)
   await training.save();

   // Configurar opciones de populate para retornar
   const populateOptions = [
     { path: 'createdBy', select: 'firstName lastName email', model: this.User },
     { path: 'rejectedBy', select: 'firstName lastName email', model: this.User },
     { path: 'levels', select: 'levelNumber title description bibliography training test isActive', model: this.Level }
   ];

   // Populate y retornar usando repositorio
   const updatedTraining = await this.trainingRepo.findByIdWithPopulate(trainingId, populateOptions);
   return updatedTraining;
 }

 // Eliminar una capacitación
 async deleteTraining(trainingId) {
   // Usar repositorio para verificar existencia
   const training = await this.trainingRepo.findById(trainingId);
   if (!training) {
     throw new Error(createTrainingNotFoundError());
   }

   // Capturar usuarios que tienen asignada la capacitación antes de eliminarla
   let assignedUsers = [];
   if (this.User) {
     assignedUsers = await this.User.find({ assignedTraining: trainingId })
       .select('_id role')
       .lean();
   }

   // Remover la capacitación de los usuarios afectados para mantener consistencia
   if (this.User && assignedUsers.length > 0) {
     await this.User.updateMany(
       { assignedTraining: trainingId },
       { $pull: { assignedTraining: trainingId } }
     );
   }

   // Eliminar todos los niveles asociados usando modelo directo (deleteMany)
   await this.Level.deleteMany({ trainingId: trainingId });

   // Eliminar la capacitación usando repositorio
   await this.trainingRepo.deleteById(trainingId);

   // Eliminar carpeta de archivos multimedia
   const fs = await import('fs');
   const path = await import('path');
   const { fileURLToPath } = await import('url');
   
   const __filename = fileURLToPath(import.meta.url);
   const __dirname = path.dirname(__filename);
   const trainingFolder = path.resolve(__dirname, "..", "..", "uploads", "trainings", trainingId);
   
   if (fs.existsSync(trainingFolder)) {
     try {
       fs.rmSync(trainingFolder, { recursive: true, force: true });
       console.log(`✅ Carpeta eliminada: ${trainingFolder}`);
     } catch (error) {
       console.error(`⚠️ Error eliminando carpeta ${trainingFolder}:`, error);
     }
   }

   return {
     message: "Capacitación, niveles y archivos asociados eliminados exitosamente",
     trainingId,
     trainingTitle: training?.title || null,
     affectedUserIds: Array.isArray(assignedUsers)
       ? assignedUsers
           .map((u) => (typeof u._id?.toString === 'function' ? u._id.toString() : u._id))
           .filter(Boolean)
       : []
   };
 }



}
export default TrainingService;

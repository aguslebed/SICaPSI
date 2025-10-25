// Servicio concreto para cursos
import { ITrainingService } from '../interfaces/ITrainingService.js';
import mongoose from 'mongoose';

export class TrainingService extends ITrainingService {
  constructor({ UserModel, LevelModel, TrainingModel }) {
    super();
    this.User = UserModel;
    this.Level = LevelModel;
    this.Training = TrainingModel;
  }

  async getCoursesForUser(userId) {
    const user = await this.User.findById(userId)
   
      .populate({
        path: 'assignedTraining',
        select: 'title subtitle description image isActive totalLevels levels createdBy report progressPercentage',
        populate: [
          { path: 'levels', select: 'levelNumber title description bibliography training test isActive', model: this.Level },
          { path: 'createdBy', select: 'firstName lastName email', model: this.User }
        ],
        model: this.Training
      })
      .exec();
    return user ? user.assignedTraining : [];
  }


  
  //Esta funcion crea una capacitacion nueva
  async createTraining(trainingData) {
   const training = await this.Training.findOne({ title: trainingData.title });

   // Por ahora es la unica restriccion.
   if (training) {
     throw new Error("El título de la capacitación ya existe");
   }

   const newTraining = new this.Training(trainingData);
   await newTraining.save();
   return newTraining;
 }

 //Devuelve todos las capacitaciones activas
 async getAllActiveTrainings() {
   const trainings = await this.Training.find({ isActive: true })
     .populate({ path: 'createdBy', select: 'firstName lastName email', model: this.User })
     .populate({ path: 'levels', select: 'levelNumber title description bibliography training test isActive', model: this.Level })
     .exec();
   return trainings;
 }

 //Devuelve TODAS las capacitaciones (activas e inactivas)
 async getAllTrainings() {
   const trainings = await this.Training.find({})
     .populate({ path: 'createdBy', select: 'firstName lastName email', model: this.User })
     .populate({ path: 'levels', select: 'levelNumber title description bibliography training test isActive', model: this.Level })
     .sort({ createdAt: -1 }) // Más recientes primero
     .exec();
   return trainings;
 }

 // Obtener una capacitación por ID
 async getTrainingById(trainingId) {
   const training = await this.Training.findById(trainingId)
     .populate({ path: 'createdBy', select: 'firstName lastName email', model: this.User })
     .populate({ 
       path: 'levels', 
       select: 'levelNumber title description bibliography training test isActive', 
       model: this.Level 
     })
     .exec();
   
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
    // Buscar el campo assignedTeacher en la colección Training
    const training = await this.Training.findById(trainingId)
      .select('assignedTeacher')
      .exec();

    if (!training || !training.assignedTeacher) return null;

    const assignedValue = training.assignedTeacher;

    // Buscar el usuario por ObjectId o, si no es válido, por email o string exacto
    let trainer = null;

    if (mongoose.Types.ObjectId.isValid(assignedValue)) {
      // Buscar por ObjectId
      trainer = await this.User.findById(assignedValue)
        .select('firstName lastName email phone profileImage role')
        .exec();
    }

    // Si no lo encontró por ID o no era un ObjectId válido, buscar por email
    if (!trainer) {
      trainer = await this.User.findOne({
        $or: [
          { email: assignedValue },
          { _id: assignedValue } // si fue guardado como string del ObjectId
        ]
      })
        .select('firstName lastName email phone profileImage role')
        .exec();
    }

    return trainer || null;
  } catch (error) {
    console.error('❌ Error en getTrainerByTrainingId:', error);
    throw new Error('Error al obtener el capacitador de la capacitación');
  }
}


 // Actualizar una capacitación
 async updateTraining(trainingId, trainingData) {
   console.log('🔄 Actualizando training:', { trainingId, title: trainingData.title });
   
   // Verificar si existe otra capacitación con el mismo título (si se está cambiando)
   if (trainingData.title) {
     const existingTraining = await this.Training.findOne({ 
       title: trainingData.title, 
       _id: { $ne: trainingId } 
     });
     
     console.log('🔍 Búsqueda de duplicados:', { 
       title: trainingData.title, 
       excludingId: trainingId,
       found: existingTraining ? existingTraining._id : null 
     });
     
     if (existingTraining) {
       console.log('❌ Título duplicado encontrado:', existingTraining._id.toString(), 'vs', trainingId.toString());
       throw new Error("Ya existe otra capacitación con ese título");
     }
   }

   // Obtener la capacitación actual
   const training = await this.Training.findById(trainingId);
   
   if (!training) {
     throw new Error("Capacitación no encontrada");
   }

   // Actualizar campos
   Object.assign(training, trainingData);
   
   // Guardar (esto ejecutará el middleware pre-save que actualiza isActive según fechas)
   await training.save();

   // Populate y retornar
   const updatedTraining = await this.Training.findById(trainingId)
     .populate({ path: 'createdBy', select: 'firstName lastName email', model: this.User })
     .populate({ path: 'levels', select: 'levelNumber title description bibliography training test isActive', model: this.Level })
     .exec();

   return updatedTraining;
 }

 // Eliminar una capacitación
 async deleteTraining(trainingId) {
   const training = await this.Training.findById(trainingId);
   if (!training) {
     throw new Error("Capacitación no encontrada");
   }

   // Eliminar todos los niveles asociados
   await this.Level.deleteMany({ trainingId: trainingId });

   // Eliminar la capacitación
   await this.Training.findByIdAndDelete(trainingId);

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

   return { message: "Capacitación, niveles y archivos asociados eliminados exitosamente" };
 }



}
export default TrainingService;

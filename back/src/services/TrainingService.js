// Servicio concreto para cursos
import { ITrainingService } from '../interfaces/ITrainingService.js';


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

   return { message: "Capacitación y niveles asociados eliminados exitosamente" };
 }



}
export default TrainingService;

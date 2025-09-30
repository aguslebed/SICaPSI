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
        select: 'title subtitle description image isActive totalLevels introduction levels createdBy report progressPercentage',
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



}
export default TrainingService;

import AppError from '../middlewares/AppError.js';



export function makeTrainingController({ trainingService, trainingValidator }) {
  return {
    async createTraining(req, res, next) {
      try {
        const trainingData = req.body;
        const { isValid, errors } = trainingValidator.validate(trainingData);
        if (!isValid) throw new AppError("Datos de capacitación inválidos", 400, "TRAINING_400", errors);
        const newTraining = await trainingService.createTraining(trainingData);
        res.status(201).json(newTraining);
      } catch (err) {
        next(err);
      }
    },

    async getAllActiveTrainings(req, res, next) {
      try {
        const trainings = await trainingService.getAllActiveTrainings();
        res.status(200).json(trainings);
      } catch (err) {
        next(err);
      } 
    },
  };
}

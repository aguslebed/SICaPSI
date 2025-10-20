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

    async getAllTrainings(req, res, next) {
      try {
        const trainings = await trainingService.getAllTrainings();
        res.status(200).json(trainings);
      } catch (err) {
        next(err);
      } 
    },

    async getTrainingById(req, res, next) {
      try {
        const { id } = req.params;
        const training = await trainingService.getTrainingById(id);
        if (!training) throw new AppError("Capacitación no encontrada", 404, "TRAINING_404");
        res.status(200).json(training);
      } catch (err) {
        next(err);
      }
    },

    async updateTraining(req, res, next) {
      try {
        const { id } = req.params;
        const trainingData = req.body;
        console.log('📥 Datos recibidos para actualizar:', { id, trainingData });
        const { isValid, errors } = trainingValidator.validate(trainingData, { isUpdate: true });
        console.log('🔍 Validación:', { isValid, errors });
        if (!isValid) throw new AppError("Datos de capacitación inválidos", 400, "TRAINING_400", errors);
        const updatedTraining = await trainingService.updateTraining(id, trainingData);
        res.status(200).json(updatedTraining);
      } catch (err) {
        next(err);
      }
    },

    async deleteTraining(req, res, next) {
      try {
        const { id } = req.params;
        await trainingService.deleteTraining(id);
        res.status(200).json({ message: "Capacitación eliminada exitosamente" });
      } catch (err) {
        next(err);
      }
    },
  };
}

import AppError from '../middlewares/AppError.js';

export function makeLevelController({ levelService }) {
  return {

    async getAlllevelsInTraining(req, res, next) {
      try {
        const { trainingId } = req.body;
        if (!trainingId) {
          throw new AppError('Falta el ID de la capacitación', 400);
        }
        const levels = await levelService.getAllLevelsInTraining(trainingId);
        res.status(200).json(levels);
      } catch (err) {
        next(err);
      }

    },

    async addLevelToTraining(req, res, next) {
      try {
        const { trainingId, title, description } = req.body;
        if (!trainingId || !title || !description) {
          throw new AppError('Faltan datos obligatorios', 400);
        }
        const newLevel = await levelService.addLevelToTraining(req.body);
        res.status(201).json(newLevel);
      }
      catch (err) {
        next(err);
      }
    }

  }
}
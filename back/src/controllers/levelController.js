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

  }
}}

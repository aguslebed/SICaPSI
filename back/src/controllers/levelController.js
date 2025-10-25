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

    async addLevelsToTraining(req, res, next) {
      try {
        const { trainingId, levels } = req.body;
        if (!trainingId || !Array.isArray(levels) || levels.length === 0) {
          throw new AppError('Faltan datos obligatorios o el arreglo de niveles está vacío', 400);
        }
        // Validar que todos los niveles sean de la misma capacitación
        const allSameTraining = levels.every(lvl => lvl.trainingId === trainingId);
        if (!allSameTraining) {
          throw new AppError('Todos los niveles deben pertenecer a la misma capacitación', 400);
        }
  const submittedBy = req.user?.userId || req.user?._id;
  const result = await levelService.addLevelsToTraining(trainingId, levels, { submittedBy });
        res.status(201).json(result);
      } catch (err) {
        next(err);
      }
    },

    async updateLevelsInTraining(req, res, next) {
      try {
        const { trainingId, levels } = req.body;
        if (!trainingId || !Array.isArray(levels) || levels.length === 0) {
          throw new AppError('Faltan datos obligatorios o el arreglo de niveles está vacío', 400);
        }
        // Validar que todos los niveles sean de la misma capacitación
        const allSameTraining = levels.every(lvl => lvl.trainingId === trainingId);
        if (!allSameTraining) {
          throw new AppError('Todos los niveles deben pertenecer a la misma capacitación', 400);
        }
  const submittedBy = req.user?.userId || req.user?._id;
  const result = await levelService.updateLevelsInTraining(trainingId, levels, { submittedBy });
        res.status(200).json(result);
      } catch (err) {
        next(err);
      }
    }

  }
}
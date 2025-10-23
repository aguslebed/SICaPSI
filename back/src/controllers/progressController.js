import AppError from "../middlewares/AppError.js";

export function makeProgressController() {
  return {
    async completeLevel(req, res, next) {
      try {
        const userId = req.user?.userId;
        const { trainingId, levelId } = req.params;
        if (!userId) throw new AppError('No autorizado', 401);
        if (!trainingId || !levelId) throw new AppError('trainingId y levelId requeridos', 400);
        const { default: ProgressService } = await import('../services/ProgressService.js');
        const progressService = new ProgressService();
        await progressService.markLevelCompleted(userId, trainingId, levelId);
        const progressMap = await progressService.getProgressByTraining(userId, [trainingId]);
        const key = (typeof trainingId === 'string') ? trainingId : trainingId.toString();
        const p = progressMap[key] || { totalLevels: 0, levelsCompleted: 0, progressPercent: 0 };
        res.status(200).json({ 
          message: 'Nivel marcado como completado', 
          progress: {
            trainingId: key,
            totalLevels: p.totalLevels,
            levelsCompleted: p.levelsCompleted,
            progressPercent: p.progressPercent
          }
        });
      } catch (err) { next(err); }
    },

    async checkLevelApproved(req, res, next) {
      try {
        const userId = req.params.userId;
        const training = req.params.trainingId;
        const level = req.level;
        if (!userId) throw new AppError('No autorizado', 401);
        
      }
        catch (err) { next(err); 

        }
      }

  };
}

export default makeProgressController;

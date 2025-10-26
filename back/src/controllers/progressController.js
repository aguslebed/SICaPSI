import AppError from "../middlewares/AppError.js";
import ProgressService from "../services/ProgressService.js";

export function makeProgressController() {
  const progressService = new ProgressService();

  return {

    async getTrainingProgress(req, res, next) {
      try {
        const userId = req.body.userId || req.user?._id;
        const trainingId = req.params.trainingId;

        if (!userId) throw new AppError('No autorizado', 401);
        if (!trainingId) throw new AppError('Falta trainingId', 400);

        const progress = await progressService.getProgressForSingleTraining(userId, trainingId);
        return res.status(200).json({ success: true, data: progress });
      } catch (err) {
        next(err);
      }
    },

    async allTrainingsProgress(req, res, next) {
      try {
        const data = await progressService.allTrainingsProgress();
        return res.status(200).json({ success: true, data });
      } catch (err) {
        next(err);
      }
    },

    async checkLevelApproved(req, res, next) {
      try {
        const userId = req.body.userId;
        const training = req.params.trainingId;
        const level = req.body.level;

        console.log(userId,"<------------------------------------------USERID")
        if (!userId) throw new AppError('No autorizado', 401);
        if (!training) throw new AppError('Falta trainingId', 400);
        if (!level) throw new AppError('Falta el objeto level en la petición', 400);


        
        // Llamar al servicio que calcula aprobación
        const result = await progressService.isLevelApproved(userId, training, level);
        return res.status(200).json({ success: true, data: result });
      } catch (err) {
        next(err);
      }
    },

    async totalTrainingProgress(req, res, next) {
      try {
        const userId = req.body.userId || req.user?._id;
        const trainingId = req.params.trainingId;

        if (!userId) throw new AppError('No autorizado', 401);
        if (!trainingId) throw new AppError('Falta trainingId', 400);

        const progress = await progressService.totalTrainingProgress(trainingId);
        return res.status(200).json({ success: true, data: progress });
      } catch (err) {
        next(err);
      }
    },

    async getLevelStatistics(req, res, next) {
      try {
        const trainingId = req.params.trainingId;
        const levelId = req.params.levelId;

        if (!trainingId) throw new AppError('Falta trainingId', 400);
        if (!levelId) throw new AppError('Falta levelId', 400);

        const statistics = await progressService.getLevelStatistics(trainingId, levelId);
        return res.status(200).json({ success: true, data: statistics });
      } catch (err) {
        next(err);
      }
    },

    async getUserTrainingStatistics(req, res, next) {
      try {
        const userId = req.params.userId;
        const trainingId = req.params.trainingId;

        if (!userId) throw new AppError('Falta userId', 400);
        if (!trainingId) throw new AppError('Falta trainingId', 400);

        const statistics = await progressService.getUserTrainingStatistics(userId, trainingId);
        
        if (statistics.error) {
          throw new AppError(statistics.error, 404);
        }

        return res.status(200).json({ success: true, data: statistics });
      } catch (err) {
        next(err);
      }
    },

    async getOptimalPath(req, res, next) {
      try {
        const trainingId = req.params.trainingId;
        const levelId = req.params.levelId;

        if (!trainingId) throw new AppError('Falta trainingId', 400);
        if (!levelId) throw new AppError('Falta levelId', 400);

        const optimalPath = await progressService.getOptimalPath(trainingId, levelId);
        
        if (optimalPath.error) {
          throw new AppError(optimalPath.error, 404);
        }

        return res.status(200).json({ success: true, data: optimalPath });
      } catch (err) {
        next(err);
      }
    },




  };
}

export default makeProgressController;

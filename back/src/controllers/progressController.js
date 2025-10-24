import AppError from "../middlewares/AppError.js";
import ProgressService from "../services/ProgressService.js";

export function makeProgressController() {
  const progressService = new ProgressService();

  return {

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
    }

  };
}

export default makeProgressController;

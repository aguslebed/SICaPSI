import { Router } from 'express';
import makeAuthMiddleware from "../middlewares/authMiddleware.js";
import { JwtTokenService } from "../services/JwtTokenService.js";
import { makeProgressController } from "../controllers/progressController.js";

const resolvedSecret = (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32)
  ? process.env.JWT_SECRET
  : (process.env.NODE_ENV === 'production' ? null : 'dev_secret_please_override_0123456789abcdef');
const jwtTokenService = new JwtTokenService({ secret: resolvedSecret });
const authMiddleware = makeAuthMiddleware({ tokenService: jwtTokenService });

const router = Router();
const controller = makeProgressController();

// Obtener progreso de un usuario en un curso específico
router.post('/trainings/:trainingId/progress', controller.getTrainingProgress);


router.post('/trainings/:trainingId/levels/:levelId/checkApproved', controller.checkLevelApproved);
router.post('/trainings/:trainingId/totalProgress', controller.totalTrainingProgress);

// Obtener estadísticas detalladas de un nivel específico
router.get('/trainings/:trainingId/levels/:levelId/statistics', controller.getLevelStatistics);

// Obtener el camino óptimo (máximo puntaje) de un nivel específico
router.get('/trainings/:trainingId/levels/:levelId/optimal-path', controller.getOptimalPath);

// Obtener estadísticas detalladas de un usuario en una capacitación (nivel por nivel)
router.get('/users/:userId/trainings/:trainingId/statistics', controller.getUserTrainingStatistics);

// Obtener resumen de progreso para todas las capacitaciones
router.get('/trainings/all', controller.allTrainingsProgress);

export default router;

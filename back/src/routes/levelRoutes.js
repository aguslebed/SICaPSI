
import { Router } from "express";
//Controller
import  {makeLevelController}  from "../controllers/levelController.js";
import { JwtTokenService } from "../services/JwtTokenService.js";
import makeAuthMiddleware from "../middlewares/authMiddleware.js";

//service
import {LevelService} from "../services/levelServices.js"

//Validator

//Models
import UserModel from "../models/User.js";
import TrainingModel from "../models/Training.js";
import LevelModel from "../models/Level.js";


const router = Router();

const levelService = new LevelService({
  LevelModel :LevelModel,
  UserModel: UserModel,
  TrainingModel: TrainingModel
});

const resolvedSecret = (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32)
  ? process.env.JWT_SECRET
  : (process.env.NODE_ENV === 'production' ? null : 'dev_secret_please_override_0123456789abcdef');
const jwtTokenService = new JwtTokenService({ secret: resolvedSecret });
const authMiddleware = makeAuthMiddleware({ tokenService: jwtTokenService });

const adminMiddleware = (req, res, next) => {
  if (!req.user || !['Administrador', 'Directivo'].includes(req.user.role)) {
    return res.status(403).json({
      message: 'Acceso denegado. Se requieren permisos de administrador.'
    });
  }
  next();
};

const controller = makeLevelController({ 
    levelService
 });

 router.get("/getAlllevelsInTraining", authMiddleware, controller.getAlllevelsInTraining);
router.post("/addLevelsToTraining", authMiddleware, adminMiddleware, controller.addLevelsToTraining);
router.put("/updateLevelsInTraining", authMiddleware, adminMiddleware, controller.updateLevelsInTraining);
 /*router.put("/updateLevelInTraining", controller.updateLevelInTraining);
 router.delete("/deleteLevelInTraining", controller.deleteLevelInTraining);*/



export default router;

import { Router } from "express";
//Controller
import  {makeTrainingController}  from "../controllers/trainingController.js";

//service
import {TrainingService} from "../services/TrainingService.js"

//Validator
import { TrainingValidator } from "../validators/trainingValidator.js";

//Models
import UserModel from "../models/User.js";
import TrainingModel from "../models/Training.js";
import LevelModel from "../models/Level.js";



const router = Router();
const trainingService = new TrainingService({
  UserModel: UserModel,
  LevelModel: LevelModel,
  TrainingModel: TrainingModel
});

const controller = makeTrainingController({ 
    trainingService,
    trainingValidator: new TrainingValidator()
 });


router.post("/createTraining", controller.createTraining)
router.get("/getAllActiveTrainings", controller.getAllActiveTrainings)

export default router;
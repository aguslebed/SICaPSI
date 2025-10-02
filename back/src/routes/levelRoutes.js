
import { Router } from "express";
//Controller
import  {makeLevelController}  from "../controllers/levelController.js";

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

const controller = makeLevelController({ 
    levelService
 });

 router.get("/getAlllevelsInTraining", controller.getAlllevelsInTraining);
 router.post("/addLevelToTraining", controller.addLevelToTraining);
 /*router.put("/updateLevelInTraining", controller.updateLevelInTraining);
 router.delete("/deleteLevelInTraining", controller.deleteLevelInTraining);*/



export default router;
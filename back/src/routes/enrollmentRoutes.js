
import { Router } from "express";
//Controller
import  {makeEnrollmentController}  from "../controllers/enrollmentController.js";

//service
import {EnrollmentService} from "../services/EnrollmentService.js"

//Validator

//Models
import UserModel from "../models/User.js";
import TrainingModel from "../models/Training.js";


const router = Router();
const enrollmentService = new EnrollmentService({
  UserModel: UserModel,
  TrainingModel: TrainingModel
});

const controller = makeEnrollmentController({ 
    enrollmentService
 });


router.post("/enrollStudent", controller.enrollStudent)
router.patch("/unenrollStudent", controller.unenrollStudent)


export default router;
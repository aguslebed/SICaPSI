
import { Router } from "express";
//Controller
import  {makeEnrollmentController}  from "../controllers/enrollmentController.js";

//service
import {EnrollmentService} from "../services/EnrollmentService.js"

//Validator

//Models
import UserModel from "../models/User.js";
import TrainingModel from "../models/Training.js";

// Audit middleware
import { createAuditMiddleware } from "../middlewares/auditMiddleware.js";

// Auth middleware
import makeAuthMiddleware from "../middlewares/authMiddleware.js";
import { JwtTokenService } from "../services/JwtTokenService.js";

// Crear auth middleware
const resolvedSecret = (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32)
    ? process.env.JWT_SECRET
    : (process.env.NODE_ENV === 'production' ? null : 'dev_secret_please_override_0123456789abcdef');

const jwtTokenService = new JwtTokenService({ secret: resolvedSecret });
const authMiddleware = makeAuthMiddleware({ tokenService: jwtTokenService });


const router = Router();
const enrollmentService = new EnrollmentService({
  UserModel: UserModel,
  TrainingModel: TrainingModel
});

const controller = makeEnrollmentController({ 
    enrollmentService
 });


router.post("/enrollStudent", 
  authMiddleware,
  createAuditMiddleware('STUDENT_ENROLLED', 'Inscribir estudiante a capacitación'),
  controller.enrollStudent
);

router.patch("/unenrollStudent", 
  authMiddleware,
  createAuditMiddleware('STUDENT_UNENROLLED', 'Desinscribir estudiante de capacitación'),
  controller.unenrollStudent
);

router.get("/getUsersEnrolledInTraining", authMiddleware, controller.getUsersEnrolledInTraining)
router.get("/getUsersNotEnrolledInTraining", authMiddleware, controller.getUsersNotEnrolledInTraining)

router.post("/enrollTrainer", 
  authMiddleware,
  createAuditMiddleware('TRAINER_ASSIGNED', 'Asignar capacitador a capacitación'),
  controller.enrollTrainer
);

router.patch("/unenrollTrainer", 
  authMiddleware,
  createAuditMiddleware('TRAINER_UNASSIGNED', 'Desasignar capacitador de capacitación'),
  controller.unenrollTrainer
);

router.get("/getTrainenrsNotEnrolledInTraining", authMiddleware, controller.getTrainenrsNotEnrolledInTraining)

export default router;
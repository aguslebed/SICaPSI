import { Router } from "express";
import { makeUserController } from "../controllers/userController.js";
import { RegistrationValidator } from "../validators/RegistrationValidator.js";
import makeAuthMiddleware from "../middlewares/authMiddleware.js";

// Modelos
import User from "../models/User.js";
import Training from "../models/Training.js";
import Level from "../models/Level.js";
import PrivateMessage from "../models/PrivateMessage.js";

// Servicios
import UserService from "../services/UserService.js";
import TrainingService from "../services/TrainingService.js";
import MessageService from "../services/MessageService.js";
import { JwtTokenService } from "../services/JwtTokenService.js";

// Formatters
import UserResponseFormatter from "../formatters/UserResponseFormatter.js";
import TrainingResponseFormatter from "../formatters/TrainingResponseFormatter.js";
import MessageResponseFormatter from "../formatters/MessageResponseFormatter.js";
 

const jwtTokenService = new JwtTokenService({ secret: process.env.JWT_SECRET });
const authMiddleware = makeAuthMiddleware({ tokenService: jwtTokenService });

const userController = makeUserController({ 
    userService: new UserService({ UserModel: User }), 
    trainingService: new TrainingService({ UserModel: User, LevelModel: Level, TrainingModel: Training }), 
    messageService: new MessageService({ PrivateMessageModel: PrivateMessage, UserModel: User, TrainingModel: Training }), 
    userFormatter: new UserResponseFormatter(), 
    trainingFormatter: new TrainingResponseFormatter(), 
    messageFormatter : new MessageResponseFormatter(), 
 });

const router = Router();
router.post("/register", RegistrationValidator, userController.create);
router.get("/", authMiddleware, userController.list);
router.get("/connect/me", authMiddleware, userController.getUserCompleteData);
router.get("/:id", authMiddleware, userController.getById);
router.patch("/:id", authMiddleware, userController.update);

export default router;
  
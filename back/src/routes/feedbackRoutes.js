import { Router } from "express";
import { makeFeedbackController } from "../controllers/feedbackController.js";
import makeAuthMiddleware from "../middlewares/authMiddleware.js";
import { JwtTokenService } from "../services/JwtTokenService.js";

const router = Router();

// Auth middleware setup
const resolvedSecret = (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32)
  ? process.env.JWT_SECRET
  : (process.env.NODE_ENV === 'production' ? null : 'dev_secret_please_override_0123456789abcdef');
const jwtTokenService = new JwtTokenService({ secret: resolvedSecret });
const authMiddleware = makeAuthMiddleware({ tokenService: jwtTokenService });

// Admin/Directivo guard
const adminMiddleware = (req, res, next) => {
  if (!req.user || !['Administrador', 'Directivo'].includes(req.user.role)) {
    return res.status(403).json({ 
      message: 'Acceso denegado. Se requieren permisos de administrador.' 
    });
  }
  next();
};

const controller = makeFeedbackController();

// Routes
router.post("/", authMiddleware, controller.createFeedback);
router.get("/training/:trainingId", authMiddleware, adminMiddleware, controller.getFeedbackByTraining);
router.get("/all", authMiddleware, adminMiddleware, controller.getAllFeedback);

export default router;

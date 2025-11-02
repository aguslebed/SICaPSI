import AppError from '../middlewares/AppError.js';
import TrainingFeedbackModel from '../models/TrainingFeedback.js';

export function makeFeedbackController() {
  return {
    async createFeedback(req, res, next) {
      try {
        const { trainingId, feedback } = req.body;
        const userId = req.user?._id || req.user?.userId;

        if (!trainingId || !feedback) {
          throw new AppError("Se requiere trainingId y feedback", 400, "FEEDBACK_400");
        }

        if (!userId) {
          throw new AppError("Usuario no autenticado", 401, "FEEDBACK_401");
        }

        // Validate feedback length
        if (feedback.trim().length === 0) {
          throw new AppError("La retroalimentación no puede estar vacía", 400, "FEEDBACK_400");
        }

        if (feedback.length > 2000) {
          throw new AppError("La retroalimentación no puede exceder 2000 caracteres", 400, "FEEDBACK_400");
        }

        const newFeedback = await TrainingFeedbackModel.create({
          training: trainingId,
          user: userId,
          feedback: feedback.trim()
        });

        const populatedFeedback = await TrainingFeedbackModel.findById(newFeedback._id)
          .populate('user', 'name email')
          .populate('training', 'title');

        res.status(201).json({
          message: 'Retroalimentación enviada exitosamente',
          feedback: populatedFeedback
        });
      } catch (err) {
        next(err);
      }
    },

    async getFeedbackByTraining(req, res, next) {
      try {
        const { trainingId } = req.params;

        if (!trainingId) {
          throw new AppError("Se requiere trainingId", 400, "FEEDBACK_400");
        }

        const feedbacks = await TrainingFeedbackModel.find({ training: trainingId })
          .populate('user', 'name email')
          .sort({ createdAt: -1 });

        res.status(200).json({
          feedbacks
        });
      } catch (err) {
        next(err);
      }
    },

    async getAllFeedback(req, res, next) {
      try {
        const feedbacks = await TrainingFeedbackModel.find()
          .populate('user', 'name email')
          .populate('training', 'title')
          .sort({ createdAt: -1 });

        res.status(200).json({
          feedbacks
        });
      } catch (err) {
        next(err);
      }
    }
  };
}

import AppError from '../middlewares/AppError.js';
import TrainingFeedbackModel from '../models/TrainingFeedback.js';
import UserModel from '../models/User.js';
import mongoose from 'mongoose';

// Helper function to resolve teacher name from assignedTeacher field
async function resolveTeacherName(assignedTeacher) {
  if (!assignedTeacher) return 'No asignado';
  
  // Check if it's a valid ObjectId
  if (mongoose.Types.ObjectId.isValid(assignedTeacher)) {
    try {
      const teacher = await UserModel.findById(assignedTeacher).select('firstName lastName');
      if (teacher) {
        return `${teacher.firstName} ${teacher.lastName}`;
      }
    } catch (error) {
      console.error('Error resolving teacher by ID:', error);
    }
  }
  
  // Check if it's an email
  if (assignedTeacher.includes('@')) {
    try {
      const teacher = await UserModel.findOne({ email: assignedTeacher }).select('firstName lastName');
      if (teacher) {
        return `${teacher.firstName} ${teacher.lastName}`;
      }
    } catch (error) {
      console.error('Error resolving teacher by email:', error);
    }
  }
  
  // If it's already a name string, return it
  return assignedTeacher;
}

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
          .populate('user', 'firstName lastName email')
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
          .populate('user', 'firstName lastName email')
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
          .populate('user', 'firstName lastName email')
          .populate('training', 'title assignedTeacher')
          .sort({ createdAt: -1 });

        // Resolve teacher names for all feedbacks
        const feedbacksWithTeacherNames = await Promise.all(
          feedbacks.map(async (feedback) => {
            const feedbackObj = feedback.toObject();
            if (feedbackObj.training?.assignedTeacher) {
              feedbackObj.training.teacherName = await resolveTeacherName(feedbackObj.training.assignedTeacher);
            }
            return feedbackObj;
          })
        );

        res.status(200).json({
          feedbacks: feedbacksWithTeacherNames
        });
      } catch (err) {
        next(err);
      }
    }
  };
}

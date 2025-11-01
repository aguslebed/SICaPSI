import AppError from '../middlewares/AppError.js';
import { emitToRole, emitToUser } from '../realtime/socket.js';



export function makeTrainingController({ trainingService, trainingValidator }) {
  return {
    async createTraining(req, res, next) {
      try {
        const trainingData = req.body;
        const { isValid, errors } = trainingValidator.validate(trainingData);
        if (!isValid) throw new AppError("Datos de capacitación inválidos", 400, "TRAINING_400", errors);
        const newTraining = await trainingService.createTraining(trainingData);
        res.status(201).json(newTraining);
      } catch (err) {
        next(err);
      }
    },

    async getAllActiveTrainings(req, res, next) {
      try {
        const trainings = await trainingService.getAllActiveTrainings();
        res.status(200).json(trainings);
      } catch (err) {
        next(err);
      } 
    },

    async getAllTrainings(req, res, next) {
      try {
        const trainings = await trainingService.getAllTrainings();
        res.status(200).json(trainings);
      } catch (err) {
        next(err);
      } 
    },

    async getPendingContent(req, res, next) {
      try {
        const trainings = await trainingService.getPendingContent();
        res.status(200).json(trainings);
      } catch (err) {
        next(err);
      }
    },

    async getTrainingById(req, res, next) {
      try {
        const { id } = req.params;
        const training = await trainingService.getTrainingById(id);
        if (!training) throw new AppError("Capacitación no encontrada", 404, "TRAINING_404");
        res.status(200).json(training);
      } catch (err) {
        next(err);
      }
    },

    async getTrainerByTrainingId(req, res, next) {
      try {
        const { id } = req.params;
        const trainer = await trainingService.getTrainerByTrainingId(id);
        if (!trainer) throw new AppError("Profesor de la capacitación no encontrado", 404, "TRAINER_404");
        res.status(200).json(trainer);
      } catch (err) {
        next(err);
      }
    },

    async updateTraining(req, res, next) {
      try {
        const { id } = req.params;
        const trainingData = req.body;
        console.log('📥 Datos recibidos para actualizar:', { id, trainingData });
        
        // Detectar si es actualización de estado (aprobación/rechazo) - skip validation
        const fields = Object.keys(trainingData);
        const isStatusUpdate = (
          fields.includes('isActive') || 
          fields.includes('pendingApproval') || 
          fields.includes('rejectionReason') ||
          fields.includes('rejectedBy')
        ) && fields.length <= 5;
        
        // Si NO es actualización de estado, validar
        if (!isStatusUpdate) {
          const isPartialUpdate = fields.length <= 3 && !fields.includes('levels');
          const { isValid, errors } = trainingValidator.validate(trainingData, { 
            isUpdate: true, 
            isPartialUpdate: isPartialUpdate 
          });
          console.log('🔍 Validación:', { isValid, errors, isPartialUpdate });
          if (!isValid) throw new AppError("Datos de capacitación inválidos", 400, "TRAINING_400", errors);
        } else {
          console.log('✅ Actualización de estado detectada, omitiendo validación');
          // Forzar consistencia de estado y setear rejectedBy según el usuario autenticado
          const userId = req.user?.userId || req.user?._id;
          const approving = trainingData.isActive === true && trainingData.pendingApproval === false;
          const rejecting = (trainingData.isActive === false && trainingData.pendingApproval === false) || (typeof trainingData.rejectionReason === 'string' && trainingData.rejectionReason.trim().length > 0);

          if (approving) {
            // Al aprobar, limpiar campos de rechazo
            trainingData.pendingApproval = false;
            trainingData.rejectionReason = '';
            trainingData.rejectedBy = null;
          }
          if (rejecting) {
            // Al rechazar, asegurar flags y setear quién rechazó
            trainingData.isActive = false;
            trainingData.pendingApproval = false;
            if (userId) trainingData.rejectedBy = userId;
          }
        }
        
        const updatedTraining = await trainingService.updateTraining(id, trainingData);

        if (isStatusUpdate && updatedTraining) {
          try {
            const trainingId = updatedTraining?._id?.toString?.() || id;
            const payload = {
              trainingId,
              title: updatedTraining?.title,
              isActive: updatedTraining?.isActive,
              pendingApproval: updatedTraining?.pendingApproval,
              rejectionReason: updatedTraining?.rejectionReason || '',
              updatedAt: updatedTraining?.updatedAt || new Date(),
              triggeredBy: req.user?.userId || null
            };
            emitToRole('Administrador', 'training:status-changed', payload);
            emitToRole('Directivo', 'training:status-changed', payload);
          } catch (socketError) {
            console.debug('Socket emit failed training status change:', socketError?.message || socketError);
          }
        }
        res.status(200).json(updatedTraining);
      } catch (err) {
        next(err);
      }
    },

    async deleteTraining(req, res, next) {
      try {
        const { id } = req.params;
        const deletionResult = await trainingService.deleteTraining(id);

        const payload = {
          trainingId: id,
          title: deletionResult?.trainingTitle || null,
          deletedAt: new Date().toISOString(),
          triggeredBy: req.user?.userId || req.user?._id || null
        };

        try {
          emitToRole('Administrador', 'training:deleted', payload);
          emitToRole('Directivo', 'training:deleted', payload);
          emitToRole('Capacitador', 'training:deleted', payload);
        } catch (emitRoleError) {
          console.debug('Socket emit failed training deletion (roles):', emitRoleError?.message || emitRoleError);
        }

        const affectedUserIds = Array.isArray(deletionResult?.affectedUserIds)
          ? deletionResult.affectedUserIds
          : [];
        if (affectedUserIds.length > 0) {
          try {
            affectedUserIds.forEach((uid) => {
              if (!uid) return;
              emitToUser(uid, 'user:data:refresh', { reason: 'training:deleted', trainingId: id });
            });
          } catch (emitUserError) {
            console.debug('Socket emit failed training deletion (users):', emitUserError?.message || emitUserError);
          }
        }

        res.status(200).json({ message: "Capacitación eliminada exitosamente" });
      } catch (err) {
        next(err);
      }
    },
  };
}

import AppError from '../middlewares/AppError.js';



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
        
        // Detectar si es actualización parcial (solo algunos campos)
        const fields = Object.keys(trainingData);
        const isPartialUpdate = fields.length <= 3 && !fields.includes('levels');
        
        const { isValid, errors } = trainingValidator.validate(trainingData, { 
          isUpdate: true, 
          isPartialUpdate: isPartialUpdate 
        });
        console.log('🔍 Validación:', { isValid, errors, isPartialUpdate });
        if (!isValid) throw new AppError("Datos de capacitación inválidos", 400, "TRAINING_400", errors);
        const submittedBy = req.user?.userId || req.user?._id;
        const updateResult = await trainingService.updateTraining(id, trainingData, { submittedBy });

        if (updateResult?.revisionCreated) {
          return res.status(202).json({
            message: 'Cambios enviados para aprobación',
            revisionId: updateResult.revisionId,
            trainingId: updateResult.trainingId,
            status: updateResult.status
          });
        }

        res.status(200).json(updateResult);
      } catch (err) {
        next(err);
      }
    },

    async deleteTraining(req, res, next) {
      try {
        const { id } = req.params;
        await trainingService.deleteTraining(id);
        res.status(200).json({ message: "Capacitación eliminada exitosamente" });
      } catch (err) {
        next(err);
      }
    },

    async listRevisions(req, res, next) {
      try {
        const { status } = req.query || {};
        const revisions = await trainingService.listPendingRevisions({ status });
        res.status(200).json(revisions);
      } catch (err) {
        next(err);
      }
    },

    async approveRevision(req, res, next) {
      try {
        const { id, revisionId } = req.params;
        const approvedBy = req.user?.userId || req.user?._id;
        const result = await trainingService.approveRevision(id, revisionId, { approvedBy });
        res.status(200).json({
          message: 'Revisión aprobada correctamente',
          training: result.training,
          revision: result.revision
        });
      } catch (err) {
        next(err);
      }
    },

    async rejectRevision(req, res, next) {
      try {
        const { id, revisionId } = req.params;
        const { reason } = req.body || {};
        const rejectedBy = req.user?.userId || req.user?._id;
        const result = await trainingService.rejectRevision(id, revisionId, { rejectedBy, reason });
        res.status(200).json({
          message: 'Revisión rechazada',
          training: result.training,
          revision: result.revision
        });
      } catch (err) {
        next(err);
      }
    }
  };
}

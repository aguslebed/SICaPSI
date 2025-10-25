// Servicio concreto para cursos
import { ITrainingService } from '../interfaces/ITrainingService.js';
import mongoose from 'mongoose';
import TrainingRevision from '../models/TrainingRevision.js';
import AppError from '../middlewares/AppError.js';

const BUSINESS_STATE = {
  DRAFT: 'Borrador',
  PENDING: 'Pendiente',
  ACTIVE: 'Activa',
  REJECTED: 'Rechazada',
  FINISHED: 'Finalizada'
};

const STATUS_ALIASES = {
  pending: ['pending', 'Pendiente'],
  approved: ['approved', 'Aprobado'],
  rejected: ['rejected', 'Rechazado']
};

const STATUS_LOOKUP = Object.entries(STATUS_ALIASES).reduce((acc, [canonical, variants]) => {
  const allVariants = [...variants, canonical];
  allVariants.forEach((variant) => {
    if (!variant) {
      return;
    }
    const key = variant.toString().trim().toLowerCase();
    if (key) {
      acc[key] = canonical;
    }
  });
  return acc;
}, {});

const normalizeRevisionStatus = (value) => {
  if (!value) {
    return '';
  }
  const key = value.toString().trim().toLowerCase();
  return STATUS_LOOKUP[key] || '';
};

const buildStatusFilterValues = (canonical) => {
  const variants = STATUS_ALIASES[canonical] || [canonical];
  const set = new Set();
  variants.concat([canonical]).forEach((variant) => {
    if (!variant) {
      return;
    }
    const str = variant.toString().trim();
    if (!str) {
      return;
    }
    set.add(str);
    set.add(str.toLowerCase());
    set.add(str.toUpperCase());
    const capitalized = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    set.add(capitalized);
  });
  return Array.from(set);
};

const sanitizeTrainingSnapshot = (trainingDoc, overrides = {}) => {
  const plain = typeof trainingDoc.toObject === 'function'
    ? trainingDoc.toObject({ depopulate: true })
    : { ...trainingDoc };

  const {
    _id,
    __v,
    createdAt,
    updatedAt,
    levels,
    hasPendingRevision,
    currentRevisionId,
    ...rest
  } = plain;

  return {
    ...rest,
    ...overrides
  };
};

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const mergeFilesPayload = (currentFiles = {}, incomingFiles = {}) => {
  const merged = { ...deepClone(currentFiles) };
  Object.entries(incomingFiles).forEach(([key, value]) => {
    if (value === null) {
      delete merged[key];
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      merged[key] = mergeFilesPayload(merged[key], value);
    } else {
      merged[key] = value;
    }
  });
  return merged;
};

export class TrainingService extends ITrainingService {
  constructor({ UserModel, LevelModel, TrainingModel }) {
    super();
    this.User = UserModel;
    this.Level = LevelModel;
    this.Training = TrainingModel;
  }

  _resolveBusinessState(training) {
    if (!training) return BUSINESS_STATE.DRAFT;

    const isExpired = training.endDate && new Date(training.endDate) < new Date();

    if (training.isActive && !training.pendingApproval && !training.rejectedBy) {
      return BUSINESS_STATE.ACTIVE;
    }

    if (!training.isActive && training.pendingApproval && !training.rejectedBy) {
      return BUSINESS_STATE.PENDING;
    }

    if (!training.isActive && !training.pendingApproval && training.rejectedBy) {
      return BUSINESS_STATE.REJECTED;
    }

    if (!training.isActive && !training.pendingApproval && !training.rejectedBy && isExpired) {
      return BUSINESS_STATE.FINISHED;
    }

    return BUSINESS_STATE.DRAFT;
  }

  _canUpdateInPlace(training) {
    const state = this._resolveBusinessState(training);
    return state === BUSINESS_STATE.DRAFT || state === BUSINESS_STATE.REJECTED;
  }

  async _ensurePendingRevision({ training, trainingData = {}, levelSnapshots = null, files = {}, submittedBy, notes }) {
    if (!submittedBy) {
      throw new Error('Usuario no autorizado para enviar revisión');
    }

    let revision = null;
    if (training.hasPendingRevision && training.currentRevisionId) {
      revision = await TrainingRevision.findById(training.currentRevisionId);
      if (revision && normalizeRevisionStatus(revision.status) !== 'pending') {
        throw new Error('La capacitación tiene una revisión en proceso');
      }
    }

    const baseTrainingSnapshot = sanitizeTrainingSnapshot(training);
    const snapshotTraining = {
      ...baseTrainingSnapshot,
      ...deepClone(trainingData)
    };

    let levelsSnapshot = levelSnapshots;
    if (!levelsSnapshot) {
      const levels = await this.Level.find({ trainingId: training._id }).lean();
      levelsSnapshot = deepClone(levels);
    }

    if (!revision) {
      revision = new TrainingRevision({
        trainingId: training._id,
        submittedBy,
        submittedAt: new Date(),
        snapshot: {
          training: snapshotTraining,
          levels: deepClone(levelsSnapshot)
        },
        files: deepClone(files || {}),
        notes: notes || ''
      });
    } else {
      revision.snapshot.training = { ...revision.snapshot.training, ...snapshotTraining };
      if (levelsSnapshot) {
        revision.snapshot.levels = deepClone(levelsSnapshot);
      }
      revision.files = mergeFilesPayload(revision.files || {}, files || {});
      revision.notes = notes !== undefined ? notes : revision.notes;
      revision.status = 'pending';
      revision.submittedBy = submittedBy;
      revision.submittedAt = new Date();
      revision.approvedBy = null;
      revision.approvedAt = null;
      revision.rejectedBy = null;
      revision.rejectedAt = null;
      revision.rejectionReason = '';
    }

    await revision.save();

    training.hasPendingRevision = true;
    training.currentRevisionId = revision._id;
    training.pendingApproval = true;
    training.rejectedBy = null;
    training.rejectionReason = '';
    await training.save();

    return revision;
  }

  async getCoursesForUser(userId) {
    const user = await this.User.findById(userId)
   
      .populate({
        path: 'assignedTraining',
        select: 'title subtitle description image isActive totalLevels levels createdBy report progressPercentage',
        populate: [
          { path: 'levels', select: 'levelNumber title description bibliography training test isActive', model: this.Level },
          { path: 'createdBy', select: 'firstName lastName email', model: this.User }
        ],
        model: this.Training
      })
      .exec();
    return user ? user.assignedTraining : [];
  }


  
  //Esta funcion crea una capacitacion nueva
  async createTraining(trainingData) {
    const existing = await this.Training.findOne({ title: trainingData.title });
    if (existing) {
      throw new AppError('El título de la capacitación ya existe', 409, 'TRAINING_DUPLICATE', [
        { field: 'title', message: 'Ya existe una capacitación con este título' }
      ]);
    }

    try {
      const newTraining = new this.Training(trainingData);
      await newTraining.save();
      return newTraining;
    } catch (error) {
      if (error?.name === 'ValidationError') {
        const details = Object.values(error.errors || {}).map((err) => ({
          field: err.path,
          message: err.message
        }));
        throw new AppError('Datos inválidos', 400, 'TRAINING_VALIDATION', details);
      }

      if (error?.code === 11000 && error?.keyPattern?.title) {
        throw new AppError('El título de la capacitación ya existe', 409, 'TRAINING_DUPLICATE', [
          { field: 'title', message: 'Ya existe una capacitación con este título' }
        ]);
      }

      throw error;
    }
  }

 //Devuelve todos las capacitaciones activas
 async getAllActiveTrainings() {
   const trainings = await this.Training.find({ isActive: true })
     .populate({ path: 'createdBy', select: 'firstName lastName email', model: this.User })
     .populate({ path: 'levels', select: 'levelNumber title description bibliography training test isActive', model: this.Level })
     .exec();
   return trainings;
 }

 //Devuelve TODAS las capacitaciones (activas e inactivas)
 async getAllTrainings() {
   const trainings = await this.Training.find({})
     .populate({ path: 'createdBy', select: 'firstName lastName email', model: this.User })
     .populate({ path: 'levels', select: 'levelNumber title description bibliography training test isActive', model: this.Level })
     .sort({ createdAt: -1 }) // Más recientes primero
     .exec();
   return trainings;
 }

 // Obtener una capacitación por ID
 async getTrainingById(trainingId) {
   const training = await this.Training.findById(trainingId)
     .populate({ path: 'createdBy', select: 'firstName lastName email', model: this.User })
     .populate({ 
       path: 'levels', 
       select: 'levelNumber title description bibliography training test isActive', 
       model: this.Level 
     })
     .exec();
   
   return training;
 }

/**
 * Devuelve el usuario que actúa como profesor de la capacitación (assignedTeacher) dado un trainingId.
 * Compatible con assignedTeacher guardado como ObjectId o como string (por ejemplo, email).
 * @param {String} trainingId
 * @returns {Object|null} Usuario (campos públicos) o null si no existe
 */
async getTrainerByTrainingId(trainingId) {
  try {
    // Buscar el campo assignedTeacher en la colección Training
    const training = await this.Training.findById(trainingId)
      .select('assignedTeacher')
      .exec();

    if (!training || !training.assignedTeacher) return null;

    const assignedValue = training.assignedTeacher;

    // Buscar el usuario por ObjectId o, si no es válido, por email o string exacto
    let trainer = null;

    if (mongoose.Types.ObjectId.isValid(assignedValue)) {
      // Buscar por ObjectId
      trainer = await this.User.findById(assignedValue)
        .select('firstName lastName email phone profileImage role')
        .exec();
    }

    // Si no lo encontró por ID o no era un ObjectId válido, buscar por email
    if (!trainer) {
      trainer = await this.User.findOne({
        $or: [
          { email: assignedValue },
          { _id: assignedValue } // si fue guardado como string del ObjectId
        ]
      })
        .select('firstName lastName email phone profileImage role')
        .exec();
    }

    return trainer || null;
  } catch (error) {
    console.error('❌ Error en getTrainerByTrainingId:', error);
    throw new Error('Error al obtener el capacitador de la capacitación');
  }
}


 // Actualizar una capacitación
 async updateTraining(trainingId, trainingData, options = {}) {
   console.log('🔄 Actualizando training:', { trainingId, title: trainingData.title });

   const training = await this.Training.findById(trainingId);

   if (!training) {
     throw new Error('Capacitación no encontrada');
   }

   // Validar duplicados para el título propuesto
   if (trainingData.title) {
     const existingTraining = await this.Training.findOne({
       title: trainingData.title,
       _id: { $ne: trainingId }
     });

     if (existingTraining) {
       console.log('❌ Título duplicado encontrado:', existingTraining._id.toString(), 'vs', trainingId.toString());
       throw new Error('Ya existe otra capacitación con ese título');
     }
   }

   const canUpdateDirectly = this._canUpdateInPlace(training) && !training.hasPendingRevision;

   if (!canUpdateDirectly) {
     const revision = await this._ensurePendingRevision({
       training,
       trainingData,
       levelSnapshots: options.levelSnapshots,
       files: options.files,
       submittedBy: options.submittedBy,
       notes: options.notes
     });

     return {
       revisionCreated: true,
       revisionId: revision._id,
       trainingId: training._id,
       status: revision.status
     };
   }

   Object.assign(training, trainingData);
   await training.save();

   const updatedTraining = await this.Training.findById(trainingId)
     .populate({ path: 'createdBy', select: 'firstName lastName email', model: this.User })
     .populate({ path: 'levels', select: 'levelNumber title description bibliography training test isActive', model: this.Level })
     .exec();

   return updatedTraining;
 }

 // Eliminar una capacitación
 async deleteTraining(trainingId) {
   const training = await this.Training.findById(trainingId);
   if (!training) {
     throw new Error("Capacitación no encontrada");
   }

   // Eliminar todos los niveles asociados
   await this.Level.deleteMany({ trainingId: trainingId });

   // Eliminar la capacitación
   await this.Training.findByIdAndDelete(trainingId);

   // Eliminar carpeta de archivos multimedia
   const fs = await import('fs');
   const path = await import('path');
   const { fileURLToPath } = await import('url');
   
   const __filename = fileURLToPath(import.meta.url);
   const __dirname = path.dirname(__filename);
   const trainingFolder = path.resolve(__dirname, "..", "..", "uploads", "trainings", trainingId);
   
   if (fs.existsSync(trainingFolder)) {
     try {
       fs.rmSync(trainingFolder, { recursive: true, force: true });
       console.log(`✅ Carpeta eliminada: ${trainingFolder}`);
     } catch (error) {
       console.error(`⚠️ Error eliminando carpeta ${trainingFolder}:`, error);
     }
   }

   return { message: "Capacitación, niveles y archivos asociados eliminados exitosamente" };
 }

  async listPendingRevisions({ status = 'pending' } = {}) {
    const filter = {};
    if (status) {
      const canonical = normalizeRevisionStatus(status) || 'pending';
      const values = buildStatusFilterValues(canonical);
      filter.status = { $in: values };
    }

    const revisions = await TrainingRevision.find(filter)
      .sort({ submittedAt: -1 })
      .lean();

    console.log('listPendingRevisions result', {
      filter,
      count: revisions.length
    });

    return revisions.map((revision) => ({
      ...revision,
      status: normalizeRevisionStatus(revision.status) || revision.status
    }));
  }

  async approveRevision(trainingId, revisionId, { approvedBy } = {}) {
    if (!approvedBy) {
      throw new AppError('Usuario no autorizado para aprobar revisiones', 403, 'REVISION_UNAUTHORIZED');
    }

    const normalizedTrainingId = trainingId ? trainingId.toString().trim() : '';
    const normalizedRevisionId = revisionId ? revisionId.toString().trim() : '';

    if (!normalizedTrainingId || !mongoose.Types.ObjectId.isValid(normalizedTrainingId)) {
      throw new AppError('Identificador de capacitación inválido', 400, 'TRAINING_INVALID_ID');
    }

    if (!normalizedRevisionId || !mongoose.Types.ObjectId.isValid(normalizedRevisionId)) {
      throw new AppError('Identificador de revisión inválido', 400, 'REVISION_INVALID_ID');
    }

    const training = await this.Training.findById(normalizedTrainingId);
    if (!training) {
      console.error('❌ approveRevision: capacitación no encontrada', { trainingId: normalizedTrainingId, revisionId: normalizedRevisionId });
      throw new AppError('Capacitación no encontrada', 404, 'TRAINING_404');
    }

    if (!training.currentRevisionId || training.currentRevisionId.toString() !== normalizedRevisionId) {
      console.error('❌ approveRevision: la revisión no corresponde a la capacitación', {
        trainingId: normalizedTrainingId,
        expectedRevision: training.currentRevisionId?.toString(),
        receivedRevision: normalizedRevisionId
      });
      throw new AppError('La revisión indicada no corresponde a la capacitación', 400, 'REVISION_MISMATCH');
    }

    const revision = await TrainingRevision.findById(normalizedRevisionId);
    if (!revision || normalizeRevisionStatus(revision.status) !== 'pending') {
      throw new AppError('La revisión indicada no está disponible para aprobarse', 409, 'REVISION_NOT_PENDING');
    }

    try {
      const wasPendingApproval = Boolean(training.pendingApproval);
      const wasInactive = training.isActive === false;
      const snapshotTraining = revision.snapshot?.training || {};
      const snapshotLevels = revision.snapshot?.levels || [];

      const allowedFields = [
        'title',
        'subtitle',
        'description',
        'image',
        'isActive',
        'pendingApproval',
        'rejectedBy',
        'rejectionReason',
        'totalLevels',
        'report',
        'progressPercentage',
        'startDate',
        'endDate',
        'assignedTeacher'
      ];

      allowedFields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(snapshotTraining, field)) {
          training[field] = snapshotTraining[field];
        }
      });

      const keepInactive = revision.metadata?.keepInactive === true;
      const shouldForceActivation = wasPendingApproval && wasInactive && !keepInactive;

      if (shouldForceActivation) {
        training.isActive = true;
      }

      training.pendingApproval = false;
      training.hasPendingRevision = false;
      training.currentRevisionId = null;
      training.rejectedBy = null;
      training.rejectionReason = '';

  await training.save();

  await this.Level.deleteMany({ trainingId });

      let insertedLevels = [];
      if (Array.isArray(snapshotLevels) && snapshotLevels.length > 0) {
        const preparedLevels = snapshotLevels.map((level) => {
          const {
            _id,
            createdAt,
            updatedAt,
            trainingId: ignoredTrainingId,
            ...restLevel
          } = level;
          return {
            ...restLevel,
            trainingId
          };
        });

        insertedLevels = await this.Level.insertMany(preparedLevels);
        training.levels = insertedLevels.map((lvl) => lvl._id);
        await training.save();
      } else {
        training.levels = [];
        await training.save();
      }

  revision.status = 'approved';
      revision.approvedBy = approvedBy;
      revision.approvedAt = new Date();
      await revision.save();

      return {
        training: await this.Training.findById(trainingId)
          .populate({ path: 'createdBy', select: 'firstName lastName email', model: this.User })
          .populate({ path: 'levels', select: 'levelNumber title description bibliography training test isActive', model: this.Level })
          .exec(),
        revision
      };
    } catch (error) {
      console.error('❌ Error aprobando revisión:', {
        trainingId: normalizedTrainingId,
        revisionId: normalizedRevisionId,
        error
      });
      throw error;
    }
  }

  async rejectRevision(trainingId, revisionId, { rejectedBy, reason } = {}) {
    if (!rejectedBy) {
      throw new AppError('Usuario no autorizado para rechazar revisiones', 403, 'REVISION_UNAUTHORIZED');
    }

    const normalizedTrainingId = trainingId ? trainingId.toString().trim() : '';
    const normalizedRevisionId = revisionId ? revisionId.toString().trim() : '';

    if (!normalizedTrainingId || !mongoose.Types.ObjectId.isValid(normalizedTrainingId)) {
      throw new AppError('Identificador de capacitación inválido', 400, 'TRAINING_INVALID_ID');
    }

    if (!normalizedRevisionId || !mongoose.Types.ObjectId.isValid(normalizedRevisionId)) {
      throw new AppError('Identificador de revisión inválido', 400, 'REVISION_INVALID_ID');
    }

    const training = await this.Training.findById(normalizedTrainingId);
    if (!training) {
      console.error('❌ rejectRevision: capacitación no encontrada', { trainingId: normalizedTrainingId, revisionId: normalizedRevisionId });
      throw new AppError('Capacitación no encontrada', 404, 'TRAINING_404');
    }

    if (!training.currentRevisionId || training.currentRevisionId.toString() !== normalizedRevisionId) {
      console.error('❌ rejectRevision: la revisión no corresponde a la capacitación', {
        trainingId: normalizedTrainingId,
        expectedRevision: training.currentRevisionId?.toString(),
        receivedRevision: normalizedRevisionId
      });
      throw new AppError('La revisión indicada no corresponde a la capacitación', 400, 'REVISION_MISMATCH');
    }

    const revision = await TrainingRevision.findById(normalizedRevisionId);
    if (!revision || normalizeRevisionStatus(revision.status) !== 'pending') {
      throw new AppError('La revisión indicada no está disponible para rechazarse', 409, 'REVISION_NOT_PENDING');
    }

    training.hasPendingRevision = false;
    training.currentRevisionId = null;
    training.pendingApproval = false;
    training.rejectedBy = rejectedBy;
    training.rejectionReason = reason || '';
    await training.save();

    revision.status = 'rejected';
    revision.rejectedBy = rejectedBy;
    revision.rejectedAt = new Date();
    revision.rejectionReason = reason || '';
    await revision.save();

    return { training, revision };
  }



}
export default TrainingService;

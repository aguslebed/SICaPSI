import { ILevelService } from "../interfaces/ILevelService.js";
import TrainingRevision from "../models/TrainingRevision.js";

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

const resolveBusinessState = (training) => {
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
};

const canUpdateInPlace = (training) => {
    const state = resolveBusinessState(training);
    return (state === BUSINESS_STATE.DRAFT || state === BUSINESS_STATE.REJECTED) && !training.hasPendingRevision;
};

const deepClone = (value) => JSON.parse(JSON.stringify(value));

export class LevelService extends ILevelService {
    constructor({ LevelModel, UserModel, TrainingModel }) {
        super();
        this.user = UserModel;
        this.training = TrainingModel;
        this.levels = LevelModel;
    }

    async _ensurePendingRevision({ training, submittedBy, notes }) {
        if (!submittedBy) {
            throw new Error('Usuario no autorizado para modificar la capacitación');
        }

        let revision = null;

        if (training.hasPendingRevision && training.currentRevisionId) {
            revision = await TrainingRevision.findById(training.currentRevisionId);
        }

        if (revision && normalizeRevisionStatus(revision.status) !== 'pending') {
            throw new Error('La capacitación tiene una revisión en proceso');
        }

        if (!revision) {
            const trainingSnapshot = training.toObject({ depopulate: true });
            const { _id, __v, createdAt, updatedAt, levels, hasPendingRevision, currentRevisionId, ...rest } = trainingSnapshot;

            revision = new TrainingRevision({
                trainingId: training._id,
                submittedBy,
                submittedAt: new Date(),
                snapshot: {
                    training: rest,
                    levels: []
                },
                notes: notes || ''
            });
        } else {
            revision.submittedBy = submittedBy;
            revision.submittedAt = new Date();
            revision.status = 'pending';
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

    async getAllLevelsInTraining(trainingId) {
        const training = await this.training.findById(trainingId);
        if (!training) {
            throw new Error("Capacitación no encontrada");
        }

        const levels = await this.levels.find({ trainingId: trainingId });
        return levels;
    }

    async addLevelsToTraining(trainingId, levels, options = {}) {
        const training = await this.training.findById(trainingId);
        if (!training) {
            throw new Error("Capacitación no encontrada");
        }

        if (!canUpdateInPlace(training)) {
            const revision = await this._ensurePendingRevision({
                training,
                submittedBy: options.submittedBy,
                notes: options.notes
            });

            const incomingLevels = Array.isArray(levels) ? deepClone(levels) : [];
            if (incomingLevels.length > 0) {
                revision.snapshot.levels = incomingLevels;
            } else {
                const currentLevels = await this.levels.find({ trainingId }).lean();
                revision.snapshot.levels = deepClone(currentLevels);
            }

            await revision.save();

            return {
                revisionId: revision._id,
                pending: true,
                levels: revision.snapshot.levels
            };
        }

        // Validar duplicados en la base de datos
        const levelNumbers = levels.map(lvl => lvl.levelNumber);
        const existingLevels = await this.levels.find({
            trainingId: trainingId,
            levelNumber: { $in: levelNumbers }
        });
        if (existingLevels.length > 0) {
            throw new Error("Uno o más números de nivel ya existen en esta capacitación");
        }

        const newLevels = await this.levels.insertMany(levels);

        const newLevelIds = newLevels.map(level => level._id);
        await this.training.findByIdAndUpdate(
            trainingId,
            { $push: { levels: { $each: newLevelIds } } },
            { new: true }
        );

        console.log(`✅ ${newLevels.length} niveles agregados al training ${trainingId}`);
        return newLevels;
    }

    async updateLevelsInTraining(trainingId, levels, options = {}) {
        const training = await this.training.findById(trainingId);
        if (!training) {
            throw new Error("Capacitación no encontrada");
        }

        if (!canUpdateInPlace(training)) {
            const revision = await this._ensurePendingRevision({
                training,
                submittedBy: options.submittedBy,
                notes: options.notes
            });

            const incomingLevels = Array.isArray(levels) ? deepClone(levels) : [];
            if (incomingLevels.length > 0) {
                revision.snapshot.levels = incomingLevels;
            } else {
                const currentLevels = await this.levels.find({ trainingId }).lean();
                revision.snapshot.levels = deepClone(currentLevels);
            }

            await revision.save();

            return {
                revisionId: revision._id,
                pending: true,
                levels: revision.snapshot.levels
            };
        }
        
        // Para cada nivel, actualizar o crear si no existe
        const updatePromises = levels.map(async (level) => {
            // Si viene con _id, actualizamos por _id
            if (level._id) {
                return await this.levels.findByIdAndUpdate(
                    level._id,
                    level,
                    { new: true, runValidators: true }
                );
            }

            // Si no viene _id, intentamos localizar por trainingId + levelNumber
            if (typeof level.levelNumber === 'number') {
                const existing = await this.levels.findOne({ trainingId, levelNumber: level.levelNumber });
                if (existing) {
                    // Actualizar el documento existente para evitar duplicados
                    return await this.levels.findByIdAndUpdate(
                        existing._id,
                        { ...existing.toObject(), ...level },
                        { new: true, runValidators: true }
                    );
                }
            }

            // Si no existe, crear nuevo
            return await this.levels.create(level);
        });

        const updatedLevels = await Promise.all(updatePromises);
        
        // IMPORTANTE: Actualizar el array de levels en el Training con todos los IDs
        const allLevelIds = updatedLevels.map(level => level._id);
        await this.training.findByIdAndUpdate(
            trainingId,
            { levels: allLevelIds }, // Reemplazar todo el array con los IDs actuales
            { new: true }
        );
        
        console.log(`✅ ${updatedLevels.length} niveles actualizados en training ${trainingId}`);
        return updatedLevels;
    }
}
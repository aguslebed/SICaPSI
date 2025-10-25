import mongoose from 'mongoose';

const { Schema } = mongoose;

const TrainingRevisionSchema = new Schema(
  {
    trainingId: { type: Schema.Types.ObjectId, ref: 'Training', required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    submittedAt: { type: Date, default: () => new Date() },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    approvedAt: { type: Date, default: null },
    rejectedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    rejectedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: '', maxlength: 2000 },
    notes: { type: String, default: '', maxlength: 2000 },
    snapshot: {
      training: { type: Schema.Types.Mixed, required: true },
      levels: { type: Array, default: [] }
    },
    files: {
      presentation: { type: Schema.Types.Mixed, default: {} },
      levels: { type: Schema.Types.Mixed, default: {} }
    },
    metadata: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

TrainingRevisionSchema.index({ trainingId: 1, status: 1 });
TrainingRevisionSchema.index({ submittedBy: 1, submittedAt: -1 });

export default mongoose.model('TrainingRevision', TrainingRevisionSchema);

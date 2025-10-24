// models/Course.js
import mongoose from "mongoose";

const TrainingSchema = new mongoose.Schema({
  title: {type: String, required: true, trim: true, maxlength: 500},
  subtitle: {type: String, required: true, maxlength: 750},
  description: {type: String, required: true, maxlength: 5000},
  image: {type: String, required: false, default: '__PENDING_UPLOAD__'},
  isActive: {type: Boolean, default: false},
  pendingApproval: {type: Boolean, default: false},
  rejectedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
  rejectionReason: {type: String, default: '', maxlength: 1000},
  createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  levels: [{type: mongoose.Schema.Types.ObjectId, ref: 'Level'}],
  totalLevels: {type: Number, default: 0},
  report: [{
    level: { type: Number },
    // score is a single numeric value (not an array)
    score: { type: Number },
    // errorsCount should be a numeric value
    errorsCount: { type: Number },
    videoUrl: { type: String },
    description: { type: String }
  }],
  progressPercentage: {type: Number, default: 0},
  startDate: {type: Date, default: null},
  endDate: {type: Date, default: null},
  assignedTeacher: {type: String, default: ''},
}, { 
  timestamps: true
});

// Índices para mejor performance
TrainingSchema.index({ createdBy: 1 });
TrainingSchema.index({ isActive: 1 });
// Índice único en title - no puede haber dos capacitaciones con el mismo título
TrainingSchema.index({ title: 1 }, { unique: true });

export default mongoose.model("Training", TrainingSchema);
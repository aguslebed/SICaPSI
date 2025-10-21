// models/Course.js
import mongoose from "mongoose";

const TrainingSchema = new mongoose.Schema({
  title: {type: String, required: true, trim: true},
  subtitle: {type: String, required: true},
  description: {type: String, required: true},
  image: {type: String, required: true},
  isActive: {type: Boolean, default: true},
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
// No usar índice único en title para permitir actualizaciones
// La validación de duplicados se hace en el servicio
// TrainingSchema.index({ title: 1 }, { unique: true, sparse: true });

export default mongoose.model("Training", TrainingSchema);
// models/Course.js
import mongoose from "mongoose";

const TrainingSchema = new mongoose.Schema({
  title: {type: String, required: true, trim: true},
  subtitle: {type: String, required: true},
  description: {type: String, required: true},
  image: {type: String, required: true},
  isActive: {type: Boolean, default: true},
  createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  introduction: {
    title: {type: String, required: true},
    subtitle: {type: String, required: true},
    welcomeMessage: {type: String, required: true}
  },
  levels: [{type: mongoose.Schema.Types.ObjectId, ref: 'Level'}],
  totalLevels: {type: Number, default: 0},
  report: [{
    level: { type: Number },
    score: [{ type: String }],
    errorsCount: { type: String },
    videoUrl: { type: String },
    description: { type: String }
  }],
  progressPercentage: {type: Number, default: 0},
}, { 
  timestamps: true
});

// Índices para mejor performance
TrainingSchema.index({ createdBy: 1 });
TrainingSchema.index({ isActive: 1 });

export default mongoose.model("Training", TrainingSchema);
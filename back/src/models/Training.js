// models/Course.js
import mongoose from "mongoose";

const TrainingSchema = new mongoose.Schema({
  title: {type: String, required: true, trim: true, maxlength: 500},
  subtitle: {type: String, required: true, maxlength: 750},
  description: {type: String, required: true, maxlength: 5000},
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

// Método para verificar y actualizar isActive según fechas
TrainingSchema.methods.updateActiveStatusByDates = function() {
  if (!this.startDate || !this.endDate) {
    return;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startDate = new Date(this.startDate);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(this.endDate);
  endDate.setHours(0, 0, 0, 0);
  
  // Si la fecha actual está entre inicio y fin, debe estar activa
  if (today >= startDate && today <= endDate) {
    this.isActive = true;
  } 
  // Si la fecha actual es antes del inicio o después del fin, debe estar inactiva
  else {
    this.isActive = false;
  }
};

// Middleware pre-save para actualizar isActive automáticamente
TrainingSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    this.updateActiveStatusByDates();
  }
  next();
});

export default mongoose.model("Training", TrainingSchema);
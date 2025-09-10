// models/UserProgress.js
import mongoose from "mongoose";

const UserProgressSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  completedLevels: [{
    levelId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Level' 
    },
    levelNumber: Number,
    completedAt: { 
      type: Date, 
      default: Date.now 
    },
    score: Number,
    attempts: Number
  }],
  currentLevel: {
    levelId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Level' 
    },
    levelNumber: { 
      type: Number, 
      default: 1 
    }
  },
  totalProgress: { 
    type: Number, 
    min: 0, 
    max: 100, 
    default: 0 
  },
  lastActivity: { 
    type: Date, 
    default: Date.now 
  },
  startedAt: { 
    type: Date, 
    default: Date.now 
  },
  completedAt: Date,
  isCompleted: { 
    type: Boolean, 
    default: false 
  }
}, {
  collection: "progreso_usuarios",
  timestamps: true
});

// Índices únicos compuestos
UserProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
UserProgressSchema.index({ userId: 1, isCompleted: 1 });

// Método para calcular progreso
UserProgressSchema.methods.calculateProgress = function() {
  const totalLevels = this.completedLevels.length + 1;
  this.totalProgress = Math.round((this.completedLevels.length / totalLevels) * 100);
  return this.totalProgress;
};

export default mongoose.model("UserProgress", UserProgressSchema);
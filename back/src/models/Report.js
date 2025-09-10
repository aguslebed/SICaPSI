// models/Report.js
import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
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
  levelId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Level', 
    required: true 
  },
  levelNumber: { 
    type: Number, 
    required: true 
  },
  score: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 100 
  },
  errors: {
    count: { 
      type: Number, 
      required: true 
    },
    details: [{
      question: String,
      correctAnswer: String,
      userAnswer: String,
      explanation: String
    }]
  },
  errorVideos: [{
    title: String,
    description: String,
    videoUrl: String,
    timestamp: String
  }],
  comment: { 
    type: String, 
    trim: true 
  },
  attemptNumber: { 
    type: Number, 
    default: 1 
  },
  status: { 
    type: String, 
    enum: ['passed', 'failed', 'in_progress'], 
    default: 'in_progress' 
  },
  timeSpent: { 
    type: Number, 
    default: 0 
  },
  completedAt: Date
}, {
  collection: "reportes",
  timestamps: true
});

// Índices para consultas eficientes
ReportSchema.index({ userId: 1, courseId: 1 });
ReportSchema.index({ levelId: 1, userId: 1 });
ReportSchema.index({ createdAt: -1 });

export default mongoose.model("Report", ReportSchema);
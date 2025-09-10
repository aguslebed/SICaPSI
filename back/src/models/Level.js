// models/Level.js
import mongoose from "mongoose";

const LevelSchema = new mongoose.Schema({
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  levelNumber: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  bibliography: [{
    title: { 
      type: String, 
      required: true 
    },
    description: String,
    downloadLinks: [{ 
      type: String, 
      required: true 
    }],
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  training: {
    videoUrl: { 
      type: String, 
      required: true 
    },
    description: String,
    duration: Number,
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  evaluation: {
    videoUrl: { 
      type: String, 
      required: true 
    },
    description: String,
    passingScore: { 
      type: Number, 
      default: 70 
    },
    maxAttempts: { 
      type: Number, 
      default: 3 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, {
  collection: "niveles",
  timestamps: true
});

// Índices
LevelSchema.index({ courseId: 1, levelNumber: 1 });
LevelSchema.index({ isActive: 1 });

export default mongoose.model("Level", LevelSchema);
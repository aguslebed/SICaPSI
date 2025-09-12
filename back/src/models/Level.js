// models/Level.js
import mongoose from "mongoose";

const LevelSchema = new mongoose.Schema(
  {
    trainingId: { type: mongoose.Schema.Types.ObjectId, ref: "Training", required: true },
    levelNumber: { type: Number, required: true, min: 1 },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },

    bibliography: [{
      title: { type: String, required: true },
      description: { type: String },
      videoUrl: [{ type: String, required: true }],
      createdAt: { type: Date, default: Date.now }
    }],

    training: {
      videoUrl: { type: String, required: true },
      description: { type: String },
      duration: { type: Number },
      createdAt: { type: Date, default: Date.now }
    }, 
    test: [{
      idScene: { type: Number, required: true },
      videoUrl: { type: String, required: true },
      description: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      lastOne: { type: Boolean, default: false},
      bonus: {type: Number, default: 0},
      options: [{
        description: { type: String, required: true },
        points: { type: Number, required: true },
        next: { type: Number, default: null } // Points to idScene
      }]
    }],

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Indexes
LevelSchema.index({ trainingId: 1, levelNumber: 1 });
LevelSchema.index({ isActive: 1 });

export default mongoose.model("Level", LevelSchema);

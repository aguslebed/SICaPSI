// models/Level.js
import mongoose from "mongoose";

const LevelSchema = new mongoose.Schema(
  {
    trainingId: { type: mongoose.Schema.Types.ObjectId, ref: "Training", required: true },
    levelNumber: { type: Number, required: true, min: 1 },
  title: { type: String, required: false, trim: true, maxlength: 500, default: '' },
  description: { type: String, maxlength: 5000, default: '' },

    bibliography: [{
      title: { type: String, required: false, maxlength: 500 },
  description: { type: String, maxlength: 2500 },
      url: { type: String, required: false },
      createdAt: { type: Date, default: Date.now }
    }],

    training: {
      title: { type: String, required: false, maxlength: 500, default: '' },
  description: { type: String, maxlength: 5000, default: '' },
      url: { type: String, required: false, default: '' },
      duration: { type: Number, default: 0 },
      createdAt: { type: Date, default: Date.now }
    }, 
    test: {
      title: {  type: String, required: false, maxlength: 500, default: ''},
  description: { type: String, maxlength: 5000, default: ''},
      imageUrl: { type: String, default: ''},
      createdAt: { type: Date, default: Date.now },
      isActive: { type: Boolean, default: true },
      scenes: [{
        idScene: { type: Number, required: true },
        videoUrl: { type: String, required: true },
  description: { type: String, required: true, maxlength: 2500 },
        lastOne: { type: Boolean, default: false},
        bonus: {type: Number, default: 0},
        options: [{
          description: { type: String, required: true, maxlength: 500 },
          points: { type: Number, required: true },
          next: { type: Number, default: null } // Points to idScene
        }]
      }]
    }
  },
  { timestamps: true }
);

// Indexes
// Ensure a training cannot have duplicate level numbers
LevelSchema.index({ trainingId: 1, levelNumber: 1 }, { unique: true });
// Optionally ensure a training cannot have duplicate level titles
LevelSchema.index({ trainingId: 1, title: 1 }, { unique: true, sparse: true });
LevelSchema.index({ isActive: 1 });

export default mongoose.model("Level", LevelSchema);

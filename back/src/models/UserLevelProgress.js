import mongoose from "mongoose";

const UserLevelProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    trainingId: { type: mongoose.Schema.Types.ObjectId, ref: "Training", required: true },
    levelId: { type: mongoose.Schema.Types.ObjectId, ref: "Level", required: true },
      status: { type: String, enum: ["in_progress", "completed"], default: "completed" },
      completed: { type: Boolean, default: true },
      completedAt: { type: Date, default: Date.now },
      // Store a simplified list of options the user selected for this level.
      // We store minimal fields (scene id, option id as string, description and points)
      selectedOptions: [
        {
          idScene: { type: String },
          optionId: { type: String },
          description: { type: String },
          points: { type: Number }
        }
      ]
  },
  { timestamps: true }
);

// Evitar duplicados para el mismo usuario-nivel
UserLevelProgressSchema.index({ userId: 1, levelId: 1 }, { unique: true });
UserLevelProgressSchema.index({ userId: 1, trainingId: 1 });

export default mongoose.model("UserLevelProgress", UserLevelProgressSchema);

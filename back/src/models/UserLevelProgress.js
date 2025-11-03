import mongoose from "mongoose";

const UserLevelProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    trainingId: { type: mongoose.Schema.Types.ObjectId, ref: "Training", required: true },
    levelId: { type: mongoose.Schema.Types.ObjectId, ref: "Level", required: true },
      status: { type: String, enum: ["in_progress", "completed", "failed"], default: "completed" },
      completed: { type: Boolean, default: true },
      approved: { type: Boolean, default: false }, // Si aprobó (>= 80%)
      completedAt: { type: Date, default: Date.now },
      // Puntajes de este intento
      earnedPoints: { type: Number, default: 0 },
      totalPoints: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 },
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

// Índices para búsquedas eficientes (SIN unique para permitir múltiples intentos)
UserLevelProgressSchema.index({ userId: 1, levelId: 1 });
UserLevelProgressSchema.index({ userId: 1, trainingId: 1 });
UserLevelProgressSchema.index({ userId: 1, levelId: 1, percentage: -1 }); // Para encontrar el mejor intento

export default mongoose.model("UserLevelProgress", UserLevelProgressSchema);

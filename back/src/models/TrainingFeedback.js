import mongoose from "mongoose";

const TrainingFeedbackSchema = new mongoose.Schema({
  training: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Training',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  feedback: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  }
}, { 
  timestamps: true
});

// Índices para mejor performance
TrainingFeedbackSchema.index({ training: 1 });
TrainingFeedbackSchema.index({ user: 1 });
TrainingFeedbackSchema.index({ training: 1, user: 1 });

export default mongoose.model("TrainingFeedback", TrainingFeedbackSchema);

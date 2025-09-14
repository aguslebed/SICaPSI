// models/PrivateMessage.js
import mongoose from "mongoose";

const PrivateMessageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  trainingId: { type: mongoose.Schema.Types.ObjectId, ref: "Training", required: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },

    attachments: [{
      filename: { type: String },
      originalName: { type: String },
      url: { type: String },
      size: { type: Number },
      uploadedAt: { type: Date, default: Date.now }
    }],

    status: { type: String, enum: ["sent", "received", "deleted"], default: "sent" },
    isRead: { type: Boolean, default: false },
    folder: { type: String, enum: ["inbox", "sent", "trash"], default: "sent" }
  },
  { timestamps: true }
);

// Indexes
PrivateMessageSchema.index({ sender: 1, folder: 1 });
PrivateMessageSchema.index({ recipient: 1, folder: 1 });
PrivateMessageSchema.index({ trainingId: 1 });
PrivateMessageSchema.index({ createdAt: -1 });

export default mongoose.model("PrivateMessage", PrivateMessageSchema);

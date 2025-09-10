// models/PrivateMessage.js
import mongoose from "mongoose";

const PrivateMessageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course' 
  },
  subject: { 
    type: String, 
    required: true, 
    trim: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  attachments: [{
    filename: String,
    originalName: String,
    url: String,
    size: Number,
    uploadedAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  status: { 
    type: String, 
    enum: ['sent', 'received', 'deleted'], 
    default: 'sent' 
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  folder: { 
    type: String, 
    enum: ['inbox', 'sent', 'trash'], 
    default: 'sent' 
  }
}, {
  collection: "mensajes_privados",
  timestamps: true
});

// Índices para búsquedas eficientes
PrivateMessageSchema.index({ sender: 1, folder: 1 });
PrivateMessageSchema.index({ recipient: 1, folder: 1 });
PrivateMessageSchema.index({ courseId: 1 });
PrivateMessageSchema.index({ createdAt: -1 });

export default mongoose.model("PrivateMessage", PrivateMessageSchema);
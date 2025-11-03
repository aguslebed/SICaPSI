// models/Content.js
import mongoose from "mongoose";

const ContentSchema = new mongoose.Schema({
  title: {type: String, required: true, trim: true, maxlength: 100},
  description: {type: String, required: true, maxlength: 500},
  author: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  type: {
    type: String, 
    required: true,
    enum: ['Control Accesos', 'Seguridad Transporte', 'Garita Peatonal', 'Reacciones', 'Actividades', 'Informacion Util']
  },
  status: {
    type: String,
    default: 'Pendiente',
    enum: ['Pendiente', 'Aprobado', 'Rechazado']
  },
  content: {type: String, required: true}, // El contenido real (texto, HTML, etc.)
  contentType: {
    type: String,
    required: true,
    enum: ['text', 'html', 'markdown', 'document']
  },
  attachments: [{
    filename: String,
    url: String,
    mimeType: String
  }],
  reviewedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
  reviewedAt: {type: Date, default: null},
  reviewComments: {type: String, default: ''},
  isActive: {type: Boolean, default: true},
}, { 
  timestamps: true
});

// Índices para mejor performance
ContentSchema.index({ author: 1 });
ContentSchema.index({ status: 1 });
ContentSchema.index({ type: 1 });
ContentSchema.index({ isActive: 1 });

export default mongoose.model("Content", ContentSchema);
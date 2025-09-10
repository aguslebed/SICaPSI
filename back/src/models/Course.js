// models/Course.js
import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  subtitle: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  image: { 
    type: String, 
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },
  asignadoA: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  }],
  introduction: {
    title: { 
      type: String, 
      required: true 
    },
    subtitle: { 
      type: String, 
      required: true 
    },
    welcomeMessage: { 
      type: String, 
      required: true 
    }
  },
  levels: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Level' 
  }],
  totalLevels: { 
    type: Number, 
    default: 0 
  }
}, {
  collection: "cursos",
  timestamps: true
});

// Índices para mejor performance
CourseSchema.index({ createdBy: 1 });
CourseSchema.index({ asignadoA: 1 });
CourseSchema.index({ isActive: 1 });

export default mongoose.model("Course", CourseSchema);
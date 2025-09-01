import mongoose from "mongoose";

/**
 * Modelo de Usuario - Define estructura de datos
 * Responsabilidades:
 * 1. Definir schema de usuario
 * 2. Configurar validaciones de datos
 * 3. Exportar modelo para uso en servicios
 * 
 * Cumple SRP: Solo define estructura y validaciones del modelo
 * Cumple OCP: Schema extensible con nuevos campos sin modificar base
 * 
 * Nota: Este modelo agrupa múltiples contextos (auth, profile, contact)
 * En un refactor futuro se podría dividir usando referencias
 */

/**
 * Schema de Usuario con validaciones
 */
const UsuarioSchema = new mongoose.Schema({
  // Identificación única
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  
  // Datos de autenticación
  mail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  contrasena: {
    type: String,
    required: true,
    minlength: 6
  },
  ultimo_ingreso: {
    type: Date,
    default: Date.now
  },

  // Datos de perfil
  nombre_completo: {
    type: String,
    required: true,
    trim: true
  },
  fecha_nacimiento: Date,
  dni: {
    type: String,
    unique: true,
    sparse: true // Permite múltiples null values
  },

  // Datos de contacto
  direccion: String,
  telefono: String,

  // Datos laborales
  legajo: {
    type: String,
    unique: true,
    sparse: true
  },
  tipo: {
    type: String,
    enum: ['admin', 'empleado', 'supervisor'],
    default: 'empleado'
  }
}, {
  collection: "Usuario",
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

// Crear modelo
const Usuario = mongoose.model("Usuario", UsuarioSchema);

export default Usuario;

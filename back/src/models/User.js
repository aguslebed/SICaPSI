/**
 * Mongoose Model: User
 * Naming conventions applied (according to SICaPSI Glossary):
 *  - Variables/fields in camelCase
 *  - Collection: 'users' (plural, lowercase)
 *  - Model layer functions (M): documented as M.User.<Action>
 */
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  documentType: { type: String, enum: ["DNI", "CUIL/CUIT", "Pasaporte"], required: true },
  documentNumber: { type: String, required: true, unique: true, sparse: true },
  birthDate: { type: Date, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  postalCode: { type: String, required: true },
  address: { type: String, required: true },
  addressNumber: { type: String, required: true },
  apartment: { type: String, required: false }, 
  province: { type: String, required: true },
  city: { type: String, required: true },
  areaCode: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Administrador", "Capacitador", "Directivo", "Alumno"], default: "Alumno", required: true },
  // CAMBIO: Campo agregado para manejar el estado de disponibilidad de profesores
  // Permite habilitar/deshabilitar profesores sin eliminar sus datos
  status: { type: String, enum: ["available", "disabled"], default: "available" },
  lastLogin: { type: Date },
  institutionalID: { type: Number, index: true, unique: true, sparse: true },
  profileImage: { type: String, required: false, default: null },
  assignedTraining: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Training'
  }],
}, { 
  timestamps: true
});

/**
 * M.User.Create (documented): instance creation
 */
export default mongoose.model("User", UserSchema);
// Pre-save hook para asignar institutionalID incremental
UserSchema.pre('save', async function(next) {
  if (this.institutionalID == null) {
    const lastUser = await this.constructor.findOne({}, {}, { sort: { institutionalID: -1 } });
    this.institutionalID = lastUser && lastUser.institutionalID != null ? lastUser.institutionalID + 1 : 0;
  }
  next();
});
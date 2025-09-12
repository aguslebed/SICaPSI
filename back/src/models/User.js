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
  role: { type: String, enum: ["Administrator", "Trainer", "Manager", "Student"], default: "Student", required: true },
  lastLogin: { type: Date },
  institutionalID: { type: String, index: true, unique: true, sparse: true, default: null },
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
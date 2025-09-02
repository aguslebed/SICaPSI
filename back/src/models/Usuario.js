/**
 * Modelo Mongoose: Usuario
 * Nomenclatura aplicada (según Glosario SICaPSI):
 *  - Variables/campos en camelCase
 *  - Colección: 'usuarios' (plural, minúscula)
 *  - Funciones de capa Modelo (M): se documentan como M.Usuario.<Accion>
 */
import mongoose from "mongoose";

const UsuarioSchema = new mongoose.Schema({
  nombreCompleto: { type: String, required: true, trim: true },
  ultimoIngreso: { type: Date },
  legajo: { type: String, index: true, unique: true, sparse: true },
  tipo: { type: String, enum: ["admin", "alumno", "capacitador", "directivo", "guardia"], required: true },
  mail: { type: String, required: true, unique: true, lowercase: true, trim: true },
  contrasena: { type: String, required: true },
  fechaNacimiento: { type: Date },
  direccion: { type: String },
  telefono: { type: String },
  dni: { type: String, unique: true, sparse: true }
}, {
  collection: "usuarios",
  timestamps: true
});

/**
 * M.Usuario.Alta (documentado): creación de instancia
 */
export default mongoose.model("Usuario", UsuarioSchema);

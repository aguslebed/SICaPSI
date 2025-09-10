/**
 * Modelo Mongoose: Usuario
 * Nomenclatura aplicada (según Glosario SICaPSI):
 *  - Variables/campos en camelCase
 *  - Colección: 'usuarios' (plural, minúscula)
 *  - Funciones de capa Modelo (M): se documentan como M.Usuario.<Accion>
 */
import mongoose from "mongoose";

const UsuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  apellidos: { type: String, required: true, trim: true },
  tipoDocumento: { type: String, enum: ["DNI", "CUIL/CUIT", "Pasaporte"], required: true },
  numeroDocumento: { type: String, required: true, unique: true, sparse: true },
  fechaNacimiento: { type: Date, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  codigoPostal: { type: String, required: true },
  direccion: { type: String, required: true },
  numeroDireccion: { type: String, required: true },
  departamento: { type: String, required: false },
  provincia: { type: String, required: true },
  localidad: { type: String, required: true },
  codArea: { type: String, required: true },
  telefono: { type: String, required: true },
  password: { type: String, required: true },
  tipo: { type: String, enum: ["admin", "alumno", "capacitador", "directivo", "guardia"], default: "alumno", required: true },
  ultimoIngreso: { type: Date },
  legajo: { type: String, index: true, unique: true, sparse: true, default: null},
  imagenPerfil: { type: String, required: false, default: null },
  cursosAsignados: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
}, {
  collection: "usuarios",
  timestamps: true
});

/**
 * M.Usuario.Alta (documentado): creación de instancia
 */
export default mongoose.model("Usuario", UsuarioSchema);
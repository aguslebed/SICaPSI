/**
 * Servicio de Usuario
 * Nomenclatura aplicada (Glosario): S.Usuario.<Accion> (documentado)
 */
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import AppError from "../middlewares/AppError.js";

const SALT_ROUNDS = 10; // Usuario.CONST.SALT_ROUNDS

export const S_Usuario_Alta = async (data) => {
  // S.Usuario.Alta
  const exists = await Usuario.findOne({ email: data.email });
  if (exists) {
    throw new AppError("El mail ya está registrado", 409, "USR_001");
  }
 
  const hashed = await bcrypt.hash(data.password, SALT_ROUNDS);
  const entity = new Usuario({
    ...data,
    password: hashed,
    ultimoIngreso: data.ultimoIngreso ?? null,
    legajo: data.legajo ?? null,
    imagenPerfil: data.imagenPerfil ?? null
  });
  const saved = await entity.save();
  return saved;
};

export const S_Usuario_BuscarPorId = async (id) => {
  // S.Usuario.BuscarPorId
  const found = await Usuario.findById(id);
  if (!found) {
    throw new AppError("Usuario no encontrado", 404, "USR_404");
  }
  return found;
};

export const S_Usuario_Listar = async (page = 1, limit = 20) => {
  // S.Usuario.Listar
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Usuario.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
    Usuario.countDocuments()
  ]);
  return { items, total, page, limit };
};

export const S_Usuario_Actualizar = async (id, patch) => {
  // S.Usuario.Actualizar
  if (patch.contras) {
    patch.password = await bcrypt.hash(patch.password, SALT_ROUNDS);
  }
  const updated = await Usuario.findByIdAndUpdate(id, patch, { new: true });
  if (!updated) {
    throw new AppError("Usuario no encontrado", 404, "USR_404");
  }
  return updated;
};
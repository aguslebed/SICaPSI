/**
 * Servicio de Usuario
 * Nomenclatura aplicada (Glosario): S.Usuario.<Accion> (documentado)
 */
import bcrypt from "bcryptjs";
import Usuario from "../models/Usuario.js";

const SALT_ROUNDS = 10; // Usuario.CONST.SALT_ROUNDS

export const S_Usuario_Alta = async (data) => {
  // S.Usuario.Alta
  const exists = await Usuario.findOne({ mail: data.mail });
  if (exists) {
    const err = new Error("El mail ya está registrado");
    err.code = "USR_001";
    err.status = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(data.contrasena, SALT_ROUNDS);
  const entity = new Usuario({
    ...data,
    contrasena: hashed,
    ultimoIngreso: data.ultimoIngreso ?? null
  });
  const saved = await entity.save();
  return saved;
};

export const S_Usuario_BuscarPorId = async (id) => {
  // S.Usuario.BuscarPorId
  const found = await Usuario.findById(id);
  if (!found) {
    const err = new Error("Usuario no encontrado");
    err.code = "USR_404";
    err.status = 404;
    throw err;
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
  if (patch.contrasena) {
    patch.contrasena = await bcrypt.hash(patch.contrasena, SALT_ROUNDS);
  }
  const updated = await Usuario.findByIdAndUpdate(id, patch, { new: true });
  if (!updated) {
    const err = new Error("Usuario no encontrado");
    err.code = "USR_404";
    err.status = 404;
    throw err;
  }
  return updated;
};

/**
 * Controlador de Usuario
 * Convención:
 *  - C.Usuario.<Accion> (documentado)
 *  - camelCase en código; la convención completa en comentarios/commits
 */
import {
  S_Usuario_Alta,
  S_Usuario_BuscarPorId,
  S_Usuario_Listar,
  S_Usuario_Actualizar
} from "../services/usuarioService.js";
import { isValidObjectId } from "mongoose";

/** C.Usuario.Alta */
export const C_Usuario_Alta = async (req, res, next) => {
  try {
    // Nota: Validaciones de formato van en validators; acá solo orquestamos.
    const saved = await S_Usuario_Alta(req.body);
    return res.status(201).json(UsuarioResponseFormatter.toPublic(saved));
  } catch (error) {
    next(error);
  }
};

/** C.Usuario.ObtenerPorId */
export const C_Usuario_ObtenerPorId = async (req, res, next) => {
  try {
    const { usuarioId } = req.params;
    if (!isValidObjectId(usuarioId)) {
      return res.status(400).json({ code: "USR_400", message: "usuarioId inválido" });
    }
    const found = await S_Usuario_BuscarPorId(usuarioId);
    return res.json(UsuarioResponseFormatter.toPublic(found));
  } catch (err) {
    next(err);
  }
};

/** C.Usuario.Listar */
export const C_Usuario_Listar = async (req, res, next) => {
  try {
    // Page & limit robustos
    const rawPage = Number(req.query.page);
    const rawLimit = Number(req.query.limit);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(Math.floor(rawLimit), 100) : 20;

    // (Opcional) Filtros/orden: si no los usás, el service los ignora o usa defaults
    // const { sortBy = "createdAt", sortDir = "desc", q } = req.query;

    const paged = await S_Usuario_Listar(page, limit /*, { sortBy, sortDir, q }*/);
    return res.json(UsuarioResponseFormatter.toPublicList(paged));
  } catch (err) {
    next(err);
  }
};

/** C.Usuario.Actualizar */
export const C_Usuario_Actualizar = async (req, res, next) => {
  try {
    const { usuarioId } = req.params;
    if (!isValidObjectId(usuarioId)) {
      return res.status(400).json({ code: "USR_400", message: "usuarioId inválido" });
    }
    const updated = await S_Usuario_Actualizar(usuarioId, req.body);
    return res.json(UsuarioResponseFormatter.toPublic(updated));
  } catch (err) {
    next(err);
  }
};

// Aliases para compatibilidad si el proyecto tenía otros nombres
export const crearUsuario = C_Usuario_Alta;
export const getUsuarioById = C_Usuario_ObtenerPorId;
export const listarUsuarios = C_Usuario_Listar;
export const actualizarUsuario = C_Usuario_Actualizar;

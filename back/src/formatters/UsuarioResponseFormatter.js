/**
 * Formateador de respuesta de Usuario
 * - Oculta campos sensibles y normaliza nombres
 * - Funciona con Document Mongoose o POJO (lean)
 */
import { UsuarioAdapter } from "../adapters/usuarioAdapter.js";

const SENSITIVE_FIELDS = new Set([
  "password",
  "__v",
  "resetToken",
  "resetTokenExp",
  "verificationCode",
  "twoFactorSecret"
]);

// Helper: clona y remueve sensibles (por si a futuro el adapter cambia)
const stripSensitive = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  const clean = { ...obj };
  for (const key of SENSITIVE_FIELDS) {
    if (key in clean) delete clean[key];
  }
  return clean;
};

const toPublicOne = (userDoc) => {
  const u = UsuarioAdapter.toApi(userDoc);
  if (!u) return null;
  return stripSensitive(u);
};

export const UsuarioResponseFormatter = {
  /**
   * Un usuario -> público
   */
  toPublic(userDoc) {
    return toPublicOne(userDoc);
  },

  /**
   * Array simple -> público
   */
  toPublicArray(list) {
    if (!Array.isArray(list)) return [];
    return list.map(toPublicOne);
  },

  /**
   * Página paginada -> público
   * Acepta forma { items, total, page, limit } o similares
   */
  toPublicList(paged = {}) {
    const items = Array.isArray(paged.items) ? paged.items : [];
    const total = Number.isFinite(paged.total) ? paged.total : items.length;
    const page = Number.isFinite(paged.page) ? paged.page : 1;
    const limit = Number.isFinite(paged.limit) ? paged.limit : items.length || 0;

    return {
      total,
      page,
      limit,
      items: items.map(toPublicOne)
    };
  }
};

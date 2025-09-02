/**
 * Adapter de traducción BD <-> API para Usuario
 * - Justifica la nomenclatura y permite transición segura si cambia algún nombre en la BD.
 */
export const UsuarioAdapter = {
  /** Mapea documento Mongoose -> JSON de API */
  toApi(doc) {
    if (!doc) return null;
    return {
      id: doc._id?.toString(),
      nombreCompleto: doc.nombreCompleto,
      ultimoIngreso: doc.ultimoIngreso,
      legajo: doc.legajo,
      tipo: doc.tipo,
      mail: doc.mail,
      fechaNacimiento: doc.fechaNacimiento,
      direccion: doc.direccion,
      telefono: doc.telefono,
      dni: doc.dni,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  },

  /** Mapea payload de API -> objeto para persistir */
  toDb(payload) {
    if (!payload) return null;
    const {
      nombreCompleto, ultimoIngreso, legajo, tipo, mail,
      contrasena, fechaNacimiento, direccion, telefono, dni
    } = payload;
    return {
      nombreCompleto, ultimoIngreso, legajo, tipo, mail,
      contrasena, fechaNacimiento, direccion, telefono, dni
    };
  }
};

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
      nombre: doc.nombre,
      apellidos: doc.apellidos,
      tipoDocumento: doc.tipoDocumento,
      numeroDocumento: doc.numeroDocumento,
      fechaNacimiento: doc.fechaNacimiento,
      email: doc.email,
      codigoPostal: doc.codigoPostal,
      direccion: doc.direccion,
      numeroDireccion: doc.numeroDireccion,
      departamento: doc.departamento,
      provincia: doc.provincia,
      localidad: doc.localidad,
      codArea: doc.codArea,
      telefono: doc.telefono,
      tipo: doc.tipo,
      legajo: doc.legajo,
      ultimoIngreso: doc.ultimoIngreso,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  },

  /** Mapea payload de API -> objeto para persistir */
  toDb(payload) {
    if (!payload) return null;
    const {
      nombre,
      apellidos,
      tipoDocumento,
      numeroDocumento,
      fechaNacimiento,
      email,
      codigoPostal,
      direccion,
      numeroDireccion,
      departamento,
      provincia,
      localidad,
      codArea,
      telefono,
      password,
      tipo,
      legajo
    } = payload;
    return {
      nombre,
      apellidos,
      tipoDocumento,
      numeroDocumento,
      fechaNacimiento,
      email,
      codigoPostal,
      direccion,
      numeroDireccion,
      departamento,
      provincia,
      localidad,
      codArea,
      telefono,
      password,
      tipo,
      legajo
    };
  }
};

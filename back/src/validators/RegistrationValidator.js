import AppError from "../middlewares/AppError.js";
/**
 * Validador de Registro de Usuario
 * Capa: Validación (se invoca desde Controlador)
 */
export const RegistrationValidator = (req, res, next) => {
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
    provincia,
    localidad,
    codArea,
    telefono,
    password
    // departamento NO es obligatorio
  } = req.body || {};

  const errors = [];
  if (!nombre) errors.push({ field: "nombre", message: "Obligatorio" });
  if (!apellidos) errors.push({ field: "apellidos", message: "Obligatorio" });
  if (!tipoDocumento) errors.push({ field: "tipoDocumento", message: "Obligatorio" });
  if (!numeroDocumento) errors.push({ field: "numeroDocumento", message: "Obligatorio" });
  if (!fechaNacimiento) errors.push({ field: "fechaNacimiento", message: "Obligatorio" });
  if (!email) errors.push({ field: "email", message: "Obligatorio" });
  if (!codigoPostal) errors.push({ field: "codigoPostal", message: "Obligatorio" });
  if (!direccion) errors.push({ field: "direccion", message: "Obligatorio" });
  if (!numeroDireccion) errors.push({ field: "numeroDireccion", message: "Obligatorio" });
  if (!provincia) errors.push({ field: "provincia", message: "Obligatorio" });
  if (!localidad) errors.push({ field: "localidad", message: "Obligatorio" });
  if (!codArea) errors.push({ field: "codArea", message: "Obligatorio" });
  if (!telefono) errors.push({ field: "telefono", message: "Obligatorio" });
  if (!password || String(password).length < 6)
    errors.push({ field: "password", message: "Mínimo 6 caracteres" });

  if (errors.length) {
    return next(new AppError("Datos inválidos", 400, "USR_400", errors));
  }
  next();
};
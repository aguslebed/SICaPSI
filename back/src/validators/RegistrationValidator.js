import AppError from "../middlewares/AppError.js";
/**
 * Validador de Registro de Usuario
 * Capa: Validación (se invoca desde Controlador)
 */
export const RegistrationValidator = (req, res, next) => {
  const {
    firstName,
    lastName,
    documentType,
    documentNumber,
    birthDate,
    email,
    postalCode,
    address,
    addressNumber, 
    province,
    city,
    areaCode,
    phone,
    password
    // departamento NO es obligatorio
  } = req.body || {};

  const errors = [];
  if (!firstName) errors.push({ field: "nombre", message: "Obligatorio" });
  if (!lastName) errors.push({ field: "apellidos", message: "Obligatorio" });
  if (!documentType) errors.push({ field: "tipoDocumento", message: "Obligatorio" });
  if (!documentNumber) errors.push({ field: "numeroDocumento", message: "Obligatorio" });
  if (!birthDate) errors.push({ field: "fechaNacimiento", message: "Obligatorio" });
  if (!email) errors.push({ field: "email", message: "Obligatorio" });
  if (!postalCode) errors.push({ field: "codigoPostal", message: "Obligatorio" });
  if (!address) errors.push({ field: "direccion", message: "Obligatorio" });
  if (!addressNumber) errors.push({ field: "numeroDireccion", message: "Obligatorio" });
  if (!province) errors.push({ field: "provincia", message: "Obligatorio" });
  if (!city) errors.push({ field: "localidad", message: "Obligatorio" });
  if (!areaCode) errors.push({ field: "codArea", message: "Obligatorio" });
  if (!phone) errors.push({ field: "telefono", message: "Obligatorio" });
  if (!password || String(password).length < 6)
    errors.push({ field: "password", message: "Mínimo 6 caracteres" });

  if (errors.length) {
    return next(new AppError("Datos inválidos", 400, "USR_400", errors));
  }
  next();
};
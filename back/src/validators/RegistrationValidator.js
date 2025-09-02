/**
 * Validador de Registro de Usuario
 * Capa: Validación (se invoca desde Controlador)
 */
export const RegistrationValidator = (req, res, next) => {
  const { nombreCompleto, mail, contrasena, tipo } = req.body || {};
  const errors = [];
  if (!nombreCompleto) errors.push({ field: "nombreCompleto", message: "Obligatorio" });
  if (!mail) errors.push({ field: "mail", message: "Obligatorio" });
  if (!contrasena || String(contrasena).length < 6) errors.push({ field: "contrasena", message: "Mínimo 6 caracteres" });
  if (!tipo) errors.push({ field: "tipo", message: "Obligatorio" });

  if (errors.length) {
    return res.status(400).json({ code: "USR_400", message: "Datos inválidos", details: errors });
  }
  next();
};

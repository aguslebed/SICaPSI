// validators/TrainingValidator.js
import { IValidator } from "../interfaces/IValidator.js";
import AppError from "../middlewares/AppError.js";

/**
 * V-[VAL]-(CLASS:TRAINING): TrainingValidator
 * SRP: valida el formato de una capacitacion/training (sin tocar BD)
 */
export class TrainingValidator extends IValidator {
  /**
   * Valida datos de un Training
   * @param {Object} data - payload del curso
   * @param {Object} options - opciones de validación
   * @param {boolean} options.isUpdate - true si es actualización, false si es creación
   * @returns {{isValid: boolean, errors: Array<{field:string,message:string}>}}
   */
  validate(data = {}, options = {}) {
    const errors = [];
    const { isUpdate = false } = options;

    // Normalización básica
    const title = String(data.title ?? "").trim();
    const subtitle = String(data.subtitle ?? "").trim();
    const description = String(data.description ?? "").trim();
    const image = String(data.image ?? "").trim();
    const createdBy = data.createdBy;

    // 1) Campos obligatorios
    if (!title) errors.push({ field: "title", message: "Título requerido" });
    if (!subtitle) errors.push({ field: "subtitle", message: "Subtítulo requerido" });
    if (!description) errors.push({ field: "description", message: "Descripción requerida" });
    if (!image) errors.push({ field: "image", message: "Imagen requerida" });
    
    // createdBy solo es requerido en creación, no en actualización
    if (!isUpdate && !createdBy) errors.push({ field: "createdBy", message: "Usuario creador requerido" });

    // 2) Report (array de objetos)
    if (Array.isArray(data.report)) {
      data.report.forEach((r, i) => {
        if (typeof r.level !== "number") {
          errors.push({ field: `report[${i}].level`, message: "Nivel debe ser numérico" });
        }
        if (typeof r.score !== "number") {
          errors.push({ field: `report[${i}].score`, message: "Score debe ser numérico" });
        }
        if (typeof r.errorsCount !== "number") {
          errors.push({ field: `report[${i}].errorsCount`, message: "ErrorsCount debe ser numérico" });
        }
        if (r.videoUrl && typeof r.videoUrl !== "string") {
          errors.push({ field: `report[${i}].videoUrl`, message: "VideoUrl debe ser string" });
        }
      });
    }

    if (errors.length) {
      throw new AppError("Datos inválidos", 400, "TRAINING_400", errors);
    }

    return { isValid: errors.length === 0, errors };
  }
}
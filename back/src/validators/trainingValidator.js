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
   * @returns {{isValid: boolean, errors: Array<{field:string,message:string}>}}
   */
  validate(data = {}) {
    const errors = [];

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
    if (!createdBy) errors.push({ field: "createdBy", message: "Usuario creador requerido" });

    // 2) Introduction
    if (!data.introduction || typeof data.introduction !== "object") {
      errors.push({ field: "introduction", message: "Introducción requerida" });
    } else {
      const intro = data.introduction;
      if (!intro.title?.trim()) errors.push({ field: "introduction.title", message: "Título de introducción requerido" });
      if (!intro.subtitle?.trim()) errors.push({ field: "introduction.subtitle", message: "Subtítulo de introducción requerido" });
      if (!intro.welcomeMessage?.trim()) errors.push({ field: "introduction.welcomeMessage", message: "Mensaje de bienvenida requerido" });
    }

    // 3) Report (array de objetos)
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
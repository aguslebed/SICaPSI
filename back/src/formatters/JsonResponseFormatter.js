// JsonResponseFormatter.js (o tu formatter actual)
import { IResponseFormatter } from "../interfaces/IResponseFormatter.js";
import { UsuarioAdapter } from "../adapters/usuarioAdapter.js";

export class JsonResponseFormatter extends IResponseFormatter {
  formatSuccess(data) {
    // Si son datos completos de usuario
    if (data && data.user && data.cursos) {
      return this.formatUserCompleteData(data);
    }
    
    // Formateo normal para otros casos
    const toPublic = (u) => {
      const obj = UsuarioAdapter.toApi(u);
      if (obj) delete obj.contrasena;
      return obj;
    };

    if (Array.isArray(data)) return { items: data.map(toPublic) };
    if (data && data.items && data.total !== undefined) {
      return { ...data, items: data.items.map(toPublic) };
    }
    return toPublic(data) ?? data;
  }

  formatUserCompleteData(completeData) {
    // Formatear usuario
    const user = UsuarioAdapter.toApi(completeData.user);
    if (user) delete user.contrasena;

    // Formatear cursos (eliminar campos sensibles si los hay)
    const trainings = completeData.cursos.map(training => ({
      _id: training._id,
      title: training.title,
      subtitle: training.subtitle,
      description: training.description,
      image: training.image,
      isActive: training.isActive,
      totalLevels: training.totalLevels,
      introduction: training.introduction,
      levels: training.levels.map(level => ({
        _id: level._id,
        levelNumber: level.levelNumber,
        title: level.title,
        description: level.description,
        bibliography: level.bibliography,
        training: level.training,
        test: level.test
      }))
    }));

    return {
      user,
      trainings,
      progress: completeData.progreso,
      messages: completeData.mensajes,
      reports: completeData.reportes,
      statistics: completeData.estadisticas
    };
  }

  formatError(error) {
    return {
      code: error.code || "ERR",
      message: error.message || "Error",
      details: error.details || null
    };
  }
}
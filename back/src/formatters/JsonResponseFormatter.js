import { IResponseFormatter } from "../interfaces/IResponseFormatter.js";
import { UsuarioAdapter } from "../adapters/usuarioAdapter.js";

export class JsonResponseFormatter extends IResponseFormatter {
  formatSuccess(data) {
    const toPublic = (u) => {
      const obj = UsuarioAdapter.toApi(u);
      if (obj) delete obj.contrasena; // ocultamos campo sensible
      return obj;
    };

    if (Array.isArray(data)) return { items: data.map(toPublic) };
    if (data && data.items && data.total !== undefined) {
      return { ...data, items: data.items.map(toPublic) };
    }
    return toPublic(data) ?? data;
  }

  formatError(error) {
    return {
      code: error.code || "ERR",
      message: error.message || "Error",
      details: error.details || null
    };
  }
}

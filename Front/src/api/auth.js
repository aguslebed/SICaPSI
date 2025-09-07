import axios from "axios";

// Usa VITE_API_URL o por defecto http://localhost:4000
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

//Existe el usuario ? Si exite, traeme todos sus datos menos la contrañse
export async function login(email, password) {
  try {
    const { data } = await api.post("/auth/login", { email, password });

    // El back puede devolver { user, token } o solo el user
    // Normalizamos para que el resto del front no explote
    return {
      user: data.user ?? data,
      token: data.token ?? null,
    };
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const msg = error.response.data?.message;

      if (status === 401) throw new Error("Credenciales inválidas");
      if (status === 404) throw new Error("Ruta no encontrada");
      throw new Error(msg || "Error en la solicitud");
    } else if (error.request) {
      throw new Error("Error de conexión con el servidor");
    } else {
      throw new Error("Error en la configuración de la petición");
    }
  }
}

import axios from "axios";
 
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

//Existe el usuario ? Si exite, traeme todos sus datos menos la contrañse
export async function login(email, password) {
  try {
    const { data } = await api.post("/auth/login", { email, password }, { withCredentials: true });

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

// Registro de usuario
export async function APIRegistro(usuario) {
  try {
    const { data } = await api.post("/login/registro", usuario, { withCredentials: true });
    return data;
  } catch (error) {
    if (error.response) {
      // Devuelve el objeto de error completo
      throw error.response.data;
    } else if (error.request) {
      throw { message: "Error de conexión con el servidor" };
    } else {
      throw { message: "Error en la configuración de la petición" };
    }
  }
}

// Logout de usuario
export async function logout() {
  try {
    await api.post('/auth/logout', {}, { withCredentials: true });
    return true;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Error al cerrar sesión');
    } else if (error.request) {
      throw new Error('Error de conexión con el servidor');
    } else {
      throw new Error('Error en la configuración de la petición');
    }
  }
}


// Verifica si el usuario está autenticado
export async function checkAuth() {
  try {
    await api.get('/auth/check-auth', { withCredentials: true });
    return true;
  } catch (error) {
    throw new Error('No autenticado');
  }
}
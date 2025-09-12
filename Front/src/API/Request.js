import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export async function login(email, password) {
  try { 

    // 1. Autenticación: solo recibe la cookie
    await api.post("/auth/login", { email, password });

    // 2. Obtener datos completos del usuario autenticado
    const { data } = await api.get("/users/connect/me"); 


    // Normalizamos para que el resto del front no explote
    return {data};
  } catch (error) {
    console.error("❌ Error en login:", error);

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
    const { data } = await api.post("/users/register", usuario); 
     
    return data;
  } catch (error) {
    console.error("❌ Error en registro:", error);
    
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
    await api.post('/auth/logout', {});
     
    return true;
  } catch (error) {
    console.error("❌ Error en logout:", error);
    
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
    const { data } = await api.get('/auth/check-auth');
    
    return {
      user: data.user ?? data,
      token: data.token ?? null,
    };
  } catch (error) {
    console.error("❌ Error en checkAuth:", error);
    
    if (error.response) {
      console.log("📋 Error del backend:", error.response.data);
    } else if (error.request) {
      console.log("🌐 Error de conexión");
    } else {
      console.log("⚙️ Error de configuración:", error.message);
    }
    
    throw new Error('No autenticado');
  }
}
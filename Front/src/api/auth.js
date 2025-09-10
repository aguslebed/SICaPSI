import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Existe el usuario? Si existe, traeme todos sus datos menos la contraseña
export async function login(email, password) {
  try {
    console.log("🔄 Enviando solicitud de login...");
    console.log("📧 Email:", email);
    
    const { data } = await api.post("/auth/login", { email, password }, { withCredentials: true });

    // MOSTRAR EN CONSOLA TODO LO QUE ENVÍA EL BACKEND
    console.log("✅ Login exitoso - Respuesta del backend:");
    console.log("📦 Datos completos recibidos:", data);
    console.log("👤 Información del usuario:", data.user);
    console.log("📚 Cursos asignados:", data.user?.cursos);
    console.log("📊 Progreso del usuario:", data.user?.progreso);
    console.log("📨 Mensajes:", data.user?.mensajes);
    console.log("📈 Reportes:", data.user?.reportes);
    console.log("📊 Estadísticas:", data.user?.estadisticas);

    // El back puede devolver { user, token } o solo el user
    // Normalizamos para que el resto del front no explote
    return {
      user: data.user ?? data,
      token: data.token ?? null,
    };
  } catch (error) {
    console.error("❌ Error en login:", error);
    
    if (error.response) {
      const status = error.response.status;
      const msg = error.response.data?.message;
      const errorData = error.response.data;

      console.log("📋 Detalles del error del backend:", errorData);

      if (status === 401) throw new Error("Credenciales inválidas");
      if (status === 404) throw new Error("Ruta no encontrada");
      throw new Error(msg || "Error en la solicitud");
    } else if (error.request) {
      console.log("🌐 Error de conexión - No hubo respuesta del servidor");
      throw new Error("Error de conexión con el servidor");
    } else {
      console.log("⚙️ Error de configuración:", error.message);
      throw new Error("Error en la configuración de la petición");
    }
  }
}

// Registro de usuario
export async function APIRegistro(usuario) {
  try {
    console.log("🔄 Enviando solicitud de registro...");
    console.log("👤 Datos del usuario:", usuario);
    
    const { data } = await api.post("/login/registro", usuario, { withCredentials: true });
    
    console.log("✅ Registro exitoso - Respuesta del backend:", data);
    
    return data;
  } catch (error) {
    console.error("❌ Error en registro:", error);
    
    if (error.response) {
      console.log("📋 Error del backend:", error.response.data);
      // Devuelve el objeto de error completo
      throw error.response.data;
    } else if (error.request) {
      console.log("🌐 Error de conexión");
      throw { message: "Error de conexión con el servidor" };
    } else {
      console.log("⚙️ Error de configuración:", error.message);
      throw { message: "Error en la configuración de la petición" };
    }
  }
}

// Logout de usuario
export async function logout() {
  try {
    console.log("🔄 Enviando solicitud de logout...");
    
    await api.post('/auth/logout', {}, { withCredentials: true });
    
    console.log("✅ Logout exitoso");
    return true;
  } catch (error) {
    console.error("❌ Error en logout:", error);
    
    if (error.response) {
      console.log("📋 Error del backend:", error.response.data);
      throw new Error(error.response.data?.message || 'Error al cerrar sesión');
    } else if (error.request) {
      console.log("🌐 Error de conexión");
      throw new Error('Error de conexión con el servidor');
    } else {
      console.log("⚙️ Error de configuración:", error.message);
      throw new Error('Error en la configuración de la petición');
    }
  }
}

// Verifica si el usuario está autenticado
export async function checkAuth() {
  try {
    console.log("🔄 Verificando autenticación...");
    
    const { data } = await api.get('/auth/check-auth', { withCredentials: true });
    
    console.log("✅ Usuario autenticado - Respuesta del backend:", data);
    console.log("👤 Datos del usuario:", data.user);
    
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
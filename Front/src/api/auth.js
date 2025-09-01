import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function login(email, password) {
  try {
    const response = await api.post('/login', { 
      email, 
      password 
    });
 
    return response.data;

  } catch (error) { 
    if (error.response) { 
      const errorMessage = error.response.data?.message || "Error en las credenciales";
      throw new Error(errorMessage);
    } else if (error.request) {// La petición fue hecha pero no se recibió respuesta
      throw new Error("Error de conexión con el servidor");
    } else { // Error al configurar la petición
      throw new Error("Error en la configuración de la petición");
    }
  }
}


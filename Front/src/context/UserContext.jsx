
import { createContext, useState, useContext, useEffect, useRef, useMemo, useCallback } from "react";
import { getMe } from "../API/Request";

const UserContext = createContext();

export function UserProvider({ children }) {
  // Inicializa el userData desde localStorage si existe
  const [userData, setUserDataState] = useState(() => {
    const stored = localStorage.getItem("userData");
    return stored ? JSON.parse(stored) : null;
  });

  // Guarda el userData en localStorage cada vez que cambia
  useEffect(() => {
    if (userData) {
      localStorage.setItem("userData", JSON.stringify(userData));
    } else {
      localStorage.removeItem("userData");
    }
  }, [userData]);

  // setUserData memoizado; la persistencia la maneja el efecto de abajo
  const setUserData = useCallback((newData) => {
    setUserDataState(newData);
  }, []);

  // Polling: refrescar datos del usuario periódicamente para detectar nuevos mensajes
  const pollRef = useRef(null);
  useEffect(() => {
    // Solo hacemos polling cuando hay un usuario autenticado con _id válido
    if (!userData || !userData._id) return;

    let mounted = true;
    const POLL_INTERVAL = 20000; // 20 segundos

    const runOnce = async () => {
      try {
        const fresh = await getMe();
        if (!mounted) return;
        // Actualizar solo si hay cambios (evita reescrituras constantes)
        try {
          const prev = JSON.stringify(userData);
          const next = JSON.stringify(fresh);
          if (prev !== next) setUserDataState(fresh);
        } catch (e) {
          // si falla la comparación, actualizamos para ser conservadores
          setUserDataState(fresh);
        }
      } catch (e) {
        // Si hay error de autenticación, limpiar los datos de usuario
        if (e.message?.includes('No autenticado') || e.message?.includes('Usuario no encontrado')) {
          console.warn('Sesión expirada, limpiando datos de usuario');
          setUserDataState(null);
        } else {
          // Otros errores los logueamos pero no rompemos la app
          console.debug('Polling getMe error:', e?.message || e);
        }
      }
    };

  // Run immediate first poll after mount (además del loader inicial)
    runOnce();
    pollRef.current = setInterval(runOnce, POLL_INTERVAL);

    // Stop polling when page is hidden to save resources
    const onVisibility = () => {
      if (document.hidden) {
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      } else {
        if (!pollRef.current) pollRef.current = setInterval(runOnce, POLL_INTERVAL);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      mounted = false;
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [userData?.__proto__ === Object.prototype ? userData?._id : userData?._id]);

  // Función para cerrar sesión y limpiar userData (memoizada)
  const logoutUser = useCallback(() => {
    setUserDataState(null);
    localStorage.removeItem("userData");
  }, []);

  const contextValue = useMemo(() => ({ 
    user: userData, // Alias para mantener consistencia
    userData, 
    setUserData, 
    logoutUser 
  }), [userData, setUserData, logoutUser]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

// Mantener compatibilidad con el código existente
export { UserContext };

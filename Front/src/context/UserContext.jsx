
import { createContext, useState, useContext, useEffect, useRef, useMemo, useCallback } from "react";
import { io } from "socket.io-client";
import { getMe, getSocketToken } from "../API/Request";

const UserContext = createContext();

export function UserProvider({ children }) {
  // Inicializa el userData desde localStorage si existe
  const [userData, setUserDataState] = useState(() => {
    const stored = localStorage.getItem("userData");
    return stored ? JSON.parse(stored) : null;
  });

  // Mantener sesiones sincronizadas entre pestañas; si otra pestaña cambia userData, replicamos aquí
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== "userData") return;
      if (event.newValue === event.oldValue) return;

      if (!event.newValue) {
        setUserDataState(null);
        return;
      }

      try {
        const parsed = JSON.parse(event.newValue);
        setUserDataState((prev) => {
          try {
            const prevStr = JSON.stringify(prev);
            const nextStr = JSON.stringify(parsed);
            return prevStr === nextStr ? prev : parsed;
          } catch {
            return parsed;
          }
        });
      } catch {
        setUserDataState(null);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

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
  const socketRef = useRef(null);
  useEffect(() => {
    const authUserId = userData?.user?._id || userData?._id;
    // Solo hacemos polling cuando hay un usuario autenticado con _id válido
    if (!authUserId) return;

    let mounted = true;
    const POLL_INTERVAL = 20000; // 20 segundos

    const runOnce = async () => {
      try {
        const fresh = await getMe();
        if (!mounted) return;
        setUserDataState((prev) => {
          try {
            const prevStr = JSON.stringify(prev);
            const nextStr = JSON.stringify(fresh);
            return prevStr === nextStr ? prev : fresh;
          } catch {
            return fresh;
          }
        });
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
  }, [userData?.user?._id, userData?._id]);

  // Realtime via Socket.IO: conecta una vez autenticado y escucha eventos de actualización
  useEffect(() => {
    const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
    const authUserId = userData?.user?._id || userData?._id;

    if (!authUserId) {
      // Si se cerró sesión, desconectar socket (si existiera)
      if (socketRef.current) {
        try { socketRef.current.disconnect(); } catch {}
        socketRef.current = null;
      }
      return;
    }

    // Evitar conexiones duplicadas
    if (socketRef.current?.connected) return;

    // Obtener token de socket vía cookie (servidor) y luego autenticar el socket
    let cancelled = false;
    (async () => {
      try {
        const token = await getSocketToken();
        if (cancelled) return;

        const socket = io(BASE, {
          transports: ["websocket"],
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          auth: { token }
        });
        socketRef.current = socket;

        const handleRefresh = async () => {
          try {
            const fresh = await getMe();
            setUserDataState((prev) => {
              try {
                const prevStr = JSON.stringify(prev);
                const nextStr = JSON.stringify(fresh);
                return prevStr === nextStr ? prev : fresh;
              } catch {
                return fresh;
              }
            });
          } catch (e) {
            // Si falla, el polling global eventualmente recuperará
            // console.debug('getMe() falló tras evento realtime:', e?.message || e);
          }
        };

        socket.on('connect', () => {
          // Opcional: sincronizar al conectar
          handleRefresh();
        });
        socket.on('disconnect', () => {
          // noop; socket.io intentará reconectar
        });
        socket.on('user:data:refresh', () => {
          handleRefresh();
        });
        socket.on('training:status-changed', (payload) => {
          handleRefresh();
          if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('realtime:training-status-changed', { detail: payload }));
          }
        });
        socket.on('training:deleted', (payload) => {
          handleRefresh();
          if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('realtime:training-deleted', { detail: payload }));
          }
        });
      } catch (e) {
        // Fallará si la cookie no está o no hay sesión; el polling se mantiene como respaldo
        // console.debug('No se pudo iniciar socket realtime:', e?.message || e);
      }
    })();

    return () => {
      cancelled = true;
      const socket = socketRef.current;
      try {
        if (socket) {
          socket.off('user:data:refresh');
          socket.off('training:status-changed');
          socket.off('training:deleted');
          socket.off('connect');
          socket.off('disconnect');
          socket.disconnect();
        }
      } catch {}
      socketRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.user?._id, userData?._id]);

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

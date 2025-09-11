
import { createContext, useState, useContext, useEffect } from "react";

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

  // setUserData que también actualiza localStorage
  const setUserData = (newData) => {
    setUserDataState(newData);
    // El efecto se encarga de persistir
  };

  // Función para cerrar sesión y limpiar userData
  const logoutUser = () => {
    setUserDataState(null);
    localStorage.removeItem("userData");
  };

  return (
    <UserContext.Provider value={{ userData, setUserData, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

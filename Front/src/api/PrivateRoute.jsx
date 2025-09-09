import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { checkAuth } from './auth';

export default function PrivateRoute({ children }) {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    checkAuth()
      .then(() => setAuth(true))
      .catch(() => setAuth(false));
  }, []);

  if (auth === null) return <div>Cargando...</div>;
  return auth ? children : <Navigate to="/login" />;
}

import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { checkAuth } from './API/Request';
import LoadingOverlay from './Components/Shared/LoadingOverlay';

export default function PrivateRoute({ children }) {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    checkAuth()
      .then(() => setAuth(true))
      .catch(() => setAuth(false));
  }, []);

  if (auth === null) return <LoadingOverlay label="Verificando sesión..." />;
  return auth ? children : <Navigate to="/login" />;
}

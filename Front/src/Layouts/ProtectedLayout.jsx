import React, { useEffect, useRef } from 'react';
import { Outlet, useLoaderData, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function RoleAwareOutlet({ me }) {
  const { userData, setUserData } = useUser();
  const hydratedRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!userData) {
      if (!hydratedRef.current) {
        if (me) {
          setUserData(me);
        } else {
          navigate('/login', { replace: true });
        }
        hydratedRef.current = true;
      } else {
        navigate('/login', { replace: true });
      }
      return;
    }

    hydratedRef.current = true;

    const role = userData?.user?.role;
    if (!role) return;

    const pathname = (location.pathname || '/').replace(/\/+$/, '') || '/';

    const resolveBaseByRole = (r) => {
      if (r === 'Administrador') return '/adminPanel';
      if (r === 'Directivo') return '/directivoPanel';
      if (r === 'Capacitador') return '/trainer';
      return '/userPanel';
    };

    const targetBase = resolveBaseByRole(role);

    const ensureMatchesRole = (requiredRole, fallback) => {
      if (role !== requiredRole) {
        const target = resolveBaseByRole(fallback ?? role);
        if (!pathname.startsWith(target)) {
          navigate(target, { replace: true });
        }
        return false;
      }
      return true;
    };

    if (pathname.startsWith('/adminPanel')) {
      ensureMatchesRole('Administrador');
      return;
    }

    if (pathname.startsWith('/directivoPanel')) {
      ensureMatchesRole('Directivo');
      return;
    }

    if (pathname.startsWith('/trainer')) {
      ensureMatchesRole('Capacitador');
      return;
    }

    if (pathname.startsWith('/userPanel')) {
      if (role === 'Administrador' || role === 'Directivo' || role === 'Capacitador') {
        if (!pathname.startsWith(targetBase)) {
          navigate(targetBase, { replace: true });
        }
      }
      return;
    }

    if (pathname === '/login') {
      if (!pathname.startsWith(targetBase)) {
        navigate(targetBase, { replace: true });
      }
    }
  }, [location.pathname, userData, me, navigate, setUserData]);

  return <Outlet />;
}

export default function ProtectedLayout() {
  const { me } = useLoaderData();
  return <RoleAwareOutlet me={me} />;
}

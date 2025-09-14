import React, { lazy } from 'react';
import { createBrowserRouter, redirect } from 'react-router-dom';
import ProtectedLayout from './Layouts/ProtectedLayout';
import StudentLayout from './Layouts/StudentLayout';
import { getMe, checkAuth } from './API/Request';
import RouteError from './Pages/RouteError';

const Mensajeria = lazy(() => import('./Pages/UserPanel/Student/Mensajeria'));

const Home = lazy(() => import('./Pages/Home/Home'));
const InicioDeSesion = lazy(() => import('./Pages/Login/Login'));
const Registrarse = lazy(() => import('./Pages/Register/Register'));
const NotFound = lazy(() => import('./Pages/NotFound'));
const PanelDeUsuario = lazy(() => import('./Pages/UserPanel/Student/UserPanel'));
const DetalleCapacitacion = lazy(() => import('./Pages/UserPanel/Student/TrainingIndex'));
const TrainingLevels = lazy(() => import('./Pages/UserPanel/Student/TrainingLevels'));
const MisReportes = lazy(() => import('./Pages/UserPanel/Student/TrainingReports'));
const NivelBibliografia = lazy(() => import('./Pages/UserPanel/Student/Levelbibliogrhapy'));
const NivelCapacitacion = lazy(() => import('./Pages/UserPanel/Student/LevelTraining'));
const LevelTest = lazy(() => import('./Pages/UserPanel/Student/LevelTest'));

async function authLoader() {
  try {
    await checkAuth();
  } catch {
    throw redirect('/login');
  }
  const me = await getMe();
  return { me };
}

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/login', element: <InicioDeSesion /> },
  { path: '/registrarse', element: <Registrarse /> },
  {
    path: '/userPanel',
    element: <ProtectedLayout />,
    loader: authLoader,
    errorElement: <RouteError />, // Friendly error UI for route loading failures
    children: [
      {
        element: <StudentLayout />,
        children: [
          { index: true, element: <PanelDeUsuario /> },
          { path: ':idTraining', element: <DetalleCapacitacion /> },
          { path: ':idTraining/levels', element: <TrainingLevels /> },
          { path: ':idTraining/reports', element: <MisReportes /> },
          { path: ':idTraining/:nivelId/bibliogrhapy', element: <NivelBibliografia /> },
          { path: ':idTraining/:nivelId/training', element: <NivelCapacitacion /> },
          { path: ':idTraining/:nivelId/levelTest', element: <LevelTest /> },
          { path: ':idTraining/messages', element: <Mensajeria /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
]);

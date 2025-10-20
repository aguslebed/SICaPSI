import React, { lazy } from 'react';
import { createBrowserRouter, redirect } from 'react-router-dom';
import ProtectedLayout from './Layouts/ProtectedLayout';
import StudentLayout from './Layouts/StudentLayout';
import TrainerLayout from './Layouts/TrainerLayout';
import UserPanelLayoutSwitcher from './Layouts/UserPanelLayoutSwitcher';
import { getMe, checkAuth } from './API/Request';
import RouteError from './Pages/RouteError';

const Mensajeria = lazy(() => import('./Pages/UserPanel/Student/Mensajeria'));
const AdminActualizarUsuario = lazy(() => import('./Pages/Register/ActualizarUsuario'));

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
const Students = lazy(() => import('./Pages/UserPanel/Student/Students'));
const Statistics = lazy(() => import('./Pages/UserPanel/Student/Statistics'));

//Capacitador pages
const TrainerPanel = lazy(() => import('./Pages/UserPanel/Trainer/TrainerPanel'));

// Admin pages (placeholders)
const AdminHome = lazy(() => import('./Pages/AdminPanel/Index'));
const AdmisionUsuario = lazy(() => import('./Pages/AdminPanel/AdmisionUsuario'));
const GestionUsuario = lazy(() => import('./Pages/AdminPanel/GestionUsuario'));
const GestionCapacitacion = lazy(() => import('./Pages/AdminPanel/GestionCapacitacion'));
const GestionProfesores = lazy(() => import('./Pages/AdminPanel/GestionProfesores'));
const ProfesorEditar = lazy(() => import('./Pages/AdminPanel/ProfesorEditar'));

async function authLoader({ request }) {
  try {
    await checkAuth();
  } catch {
    throw redirect('/login');
  }
  const me = await getMe();

  // Decide preferred base path depending on role
  const role = me?.user?.role;
  const url = new URL(request.url);
  const currentPath = url.pathname.replace(/\/$/, '');

  // If trainer and currently not under /trainer -> redirect to /trainer
  if (role === 'Capacitador' && !currentPath.startsWith('/trainer')) {
    throw redirect('/trainer');
  }

  // If not trainer and currently under /trainer -> redirect to /userPanel
  if (role !== 'Capacitador' && currentPath.startsWith('/trainer')) {
    throw redirect('/userPanel');
  }

  return { me };
}

async function adminLoader() {
  // Verifica sesión y rol de administrador; si no, redirige a /userPanel
  try {
    await checkAuth();
  } catch {
    throw redirect('/login');
  }
  const me = await getMe();
  const role = me?.user?.role;
  if (role !== 'Administrador') {
    throw redirect('/userPanel');
  }
  
  return { me };
}

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/login', element: <InicioDeSesion /> },
  { path: '/registrarse', element: <Registrarse /> },
  {
    path: '/adminPanel',
    element: <ProtectedLayout />,
    loader: adminLoader,
    errorElement: <RouteError />,
    children: [
      // Página principal del panel admin
      { index: true, element: <AdminHome /> },
      // Secciones solicitadas
      { path: 'admisionUsuario', element: <AdmisionUsuario /> },
      { path: 'gestionUsuario', element: <GestionUsuario /> },
      { path: 'gestionCapacitacion', element: <GestionCapacitacion /> },
  { path: 'gestionProfesores', element: <GestionProfesores /> },
  { path: 'profesorEditar/:id', element: <ProfesorEditar /> },
      // Crear Usuario: debe renderizar el Register.jsx
      { path: 'gestionUsuario/crearUsuario', element: <Registrarse /> },
      { path: 'gestionUsuario/modificarUsuario', element: <AdminActualizarUsuario /> }

    ]
  },
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
          { path: ':idTraining/students', element: <Students /> },
          { path: ':idTraining/statistics', element: <Statistics /> },
        ],
      },
    ],
  },
  {
    path: '/trainer',
    element: <ProtectedLayout />,
    loader: authLoader,
    errorElement: <RouteError />,
    children: [
      {
        element: <TrainerLayout />,
        children: [
          { index: true, element: <TrainerPanel /> },
          { path: ':idTraining', element: <DetalleCapacitacion /> },
          { path: ':idTraining/levels', element: <TrainingLevels /> },
          { path: ':idTraining/:nivelId/bibliogrhapy', element: <NivelBibliografia /> },
          { path: ':idTraining/:nivelId/training', element: <NivelCapacitacion /> },
          { path: ':idTraining/:nivelId/levelTest', element: <LevelTest /> },
          { path: ':idTraining/messages', element: <Mensajeria /> },
          { path: ':idTraining/students', element: <Students /> },
          { path: ':idTraining/statistics', element: <Statistics /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
]);

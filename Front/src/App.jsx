import React, { Suspense } from 'react';
import './App.css';
import { RouterProvider } from 'react-router-dom';
import { router } from './Routes';
import LoadingOverlay from './Components/Shared/LoadingOverlay';

function App() {
  return (
    <Suspense fallback={<LoadingOverlay label="Cargando aplicación..." />}> 
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;
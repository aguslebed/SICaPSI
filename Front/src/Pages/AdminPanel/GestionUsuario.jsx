import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function GestionUsuario() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Gestión Usuario</h1>
      <div className="mt-4 flex items-center gap-3">
        <Link to="/adminPanel/gestionUsuario/crearUsuario" className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg">Crear Usuario</Link>
      </div>
      <Outlet />
    </main>
  );
}

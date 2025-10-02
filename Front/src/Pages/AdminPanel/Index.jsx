import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../../Components/Student/NavBar'

export default function AdminIndex() {
  return (
    <>
        <NavBar />
        <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/adminPanel/admisionUsuario" className="border rounded-lg p-4 hover:bg-gray-50">Admision Usuario</Link>
            <Link to="/adminPanel/gestionUsuario" className="border rounded-lg p-4 hover:bg-gray-50">Gestión Usuario</Link>
            <Link to="/adminPanel/gestionCursos" className="border rounded-lg p-4 hover:bg-gray-50">Gestión Cursos</Link>
            <Link to="/adminPanel/gestionProfesores" className="border rounded-lg p-4 hover:bg-gray-50">Gestión Profesores</Link>
        </div>
        </main>
    </>
  );
}

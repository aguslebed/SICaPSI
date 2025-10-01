import React from 'react';
import { Link, Outlet } from 'react-router-dom';

import NavBar from '../../Components/Student/NavBar';
import OpenCohortModal from '../../Components/Modals/OpenCohortModal';
import CreateTrainingModal from '../../Components/Modals/CreateTrainingModal';
import { useState } from 'react';

export default function GestionCursos() {
  const [openCohorte, setOpenCohorte] = useState(false);

  // sample data placeholders (will come from API later)
  const sampleCursos = [
    { _id: 'c1', title: 'Capacitación 1 - Edificio de departamentos' },
    { _id: 'c2', title: 'Capacitación 2 - Barrio privado chico' },
  ];
  const sampleProfesores = [
    { _id: 'p1', displayName: 'Juan Perez (Disponible)' },
    { _id: 'p2', displayName: 'Pedro Pascal' },
  ];
  const [openCreateTraining, setOpenCreateTraining] = useState(false);
  return (
    <>
      <NavBar />
      <main className="p-6">
        <h1 className="text-3xl font-semibold mb-2">Gestión de cursos</h1>
        <hr className="border-gray-300 mb-6" />

        <div className="bg-white shadow-sm rounded p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Left: buscador y botones */}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Buscar curso"
                  className="w-full max-w-md border rounded-full px-4 py-2 text-sm focus:outline-none"
                />
                <button className="w-10 h-10 rounded bg-sky-500 flex items-center justify-center text-white">🔍</button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button className="bg-sky-500 text-white px-3 py-1 rounded text-sm">Aplicar Filtros</button>
                <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm">Limpiar Filtros</button>
              </div>
            </div>

            {/* Center: selects centrados */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <select className="border rounded px-3 py-2 text-sm w-40 text-center">
                <option value="">Nivel</option>
                <option value="nivel1">Nivel 1</option>
                <option value="nivel2">Nivel 2</option>
                <option value="nivel3">Nivel 3</option>
              </select>

              <select className="border rounded px-3 py-2 text-sm w-40 text-center">
                <option value="">Estado</option>
                <option value="asignado">Asignado</option>
                <option value="sin_asignar">Sin asignar</option>
              </select>
            </div>

            {/* Right: acciones */}
            <div className="flex items-center gap-3 ml-auto">
              <button onClick={() => setOpenCohorte(true)} className="bg-sky-400 hover:bg-sky-500 text-white px-4 py-2 rounded-lg">Abrir Cohorte</button>
              <button onClick={() => setOpenCreateTraining(true)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">Crear Capacitación</button>
            </div>
          </div>
        </div>

        <section className="mt-6">
          <div className="overflow-hidden bg-white rounded shadow-sm">
            <table className="min-w-full">
              <thead>
                <tr className="bg-[#0888c2] text-white">
                  <th className="px-6 py-4 text-left font-semibold">Capacitación</th>
                  <th className="px-6 py-4 text-left font-semibold">Nivel</th>
                  <th className="px-6 py-4 text-left font-semibold">Profesor Asignado</th>
                  <th className="px-6 py-4 text-left font-semibold">Cupos</th>
                  <th className="px-6 py-4 text-left font-semibold">Estado</th>
                  <th className="px-6 py-4 text-left font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y">
                {/* Datos vendrán desde la base -> por ahora estado vacío */}
                <tr>
                  <td className="px-6 py-8 text-sm text-gray-600" colSpan={6}>
                    No hay cursos para mostrar.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <Outlet />
      </main>
      <OpenCohortModal
        open={openCohorte}
        onClose={() => setOpenCohorte(false)}
        cursos={sampleCursos}
        profesores={sampleProfesores}
        onSave={(payload) => console.log('Guardar cohorte', payload)} //Por ahora asi 
      />
      <CreateTrainingModal
        open={openCreateTraining}
        onClose={() => setOpenCreateTraining(false)}
        onSave={(payload) => console.log('Crear capacitación', payload)}
      />
    </>
  );
}


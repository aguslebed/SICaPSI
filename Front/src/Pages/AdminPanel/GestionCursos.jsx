import React from 'react';
import { Link, Outlet } from 'react-router-dom';

import NavBar from '../../Components/Student/NavBar';
import OpenCohortModal from '../../Components/Modals/OpenCohortModal';
import CreateTrainingModal from '../../Components/Modals/CreateTrainingModal';
import { useState, useEffect } from 'react';
import { getAllActiveTrainings } from '../../API/Request';
import LoadingOverlay from '../../Components/Shared/LoadingOverlay';

export default function GestionCursos() {
  const [openCohorte, setOpenCohorte] = useState(false);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // sample profesores placeholder (could come from API later)
  const sampleProfesores = [
    { _id: 'p1', displayName: 'Juan Perez (Disponible)' },
    { _id: 'p2', displayName: 'Pedro Pascal' },
  ];

  useEffect(() => {
    let mounted = true;
    const fetchTrainings = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllActiveTrainings();
        // backend may return an array or { items: [] }
        const items = Array.isArray(data) ? data : (data?.items || []);
        if (mounted) setTrainings(items);
      } catch (err) {
        console.error('Error fetching trainings', err);
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTrainings();
    return () => { mounted = false; };
  }, []);
  const [openCreateTraining, setOpenCreateTraining] = useState(false);
  return (
    <>
      <NavBar />
      <main className="w-full">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 py-6">
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
                <button className="w-10 h-10 rounded bg-sky-500 flex items-center justify-center text-white cursor-pointer">🔍</button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button className="bg-sky-500 text-white px-3 py-1 rounded text-sm cursor-pointer">Aplicar Filtros</button>
                <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm cursor-pointer">Limpiar Filtros</button>
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
              <button onClick={() => setOpenCohorte(true)} className="bg-sky-400 hover:bg-sky-500 text-white px-4 py-2 rounded-lg cursor-pointer">Abrir Cohorte</button>
              <button onClick={() => setOpenCreateTraining(true)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer">Crear Capacitación</button>
            </div>
          </div>
        </div>

        <section className="mt-6">
          <div className="overflow-hidden bg-white rounded shadow-sm">
            {loading && <LoadingOverlay label="Cargando capacitaciones..." />}
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
                {(!trainings || trainings.length === 0) && !loading ? (
                  <tr>
                    <td className="px-6 py-8 text-sm text-gray-600" colSpan={6}>
                      No hay cursos para mostrar.
                    </td>
                  </tr>
                ) : (
                  trainings.map((t) => {
                    const firstLevel = t.levels && t.levels.length ? (t.levels[0].levelNumber || t.levels[0].levelNumber) : null;
                    const nivelLabel = firstLevel ? `Nivel ${firstLevel}` : (t.totalLevels ? `Nivel 1` : '—');
                    const profesor = t.createdBy ? `${t.createdBy.firstName || ''} ${t.createdBy.lastName || ''}`.trim() : '-';
                    const estado = t.createdBy ? 'Asignado' : 'Sin asignar';
                    return (
                      <tr key={t._id}>
                        <td className="px-6 py-6">
                          <div className="font-semibold">{t.title}</div>
                          <div className="text-sm text-gray-600">{t.subtitle}</div>
                        </td>
                        <td className="px-6 py-6">{nivelLabel}</td>
                        <td className="px-6 py-6">{profesor || '-'}</td>
                        <td className="px-6 py-6">-</td>
                        <td className={`px-6 py-6 ${estado === 'Asignado' ? 'text-green-600' : 'text-red-500'}`}>{estado}</td>
                        <td className="px-6 py-6">
                          <div className="flex gap-2">
                            <button className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded text-sm">Editar</button>
                            <button className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm">Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <Outlet />
        </div>
      </main>
      <OpenCohortModal
        open={openCohorte}
        onClose={() => setOpenCohorte(false)}
        cursos={trainings}
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


import React, { useState } from 'react';

export default function OpenCohortModal({ open, onClose, onSave, cursos = [], profesores = [] }) {
  const [curso, setCurso] = useState(cursos?.[0]?._id || cursos?.[0] || '');
  const [profesor, setProfesor] = useState(profesores?.[0]?._id || profesores?.[0] || '');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  if (!open) return null;

  const handleSave = () => {
    const payload = { curso, profesor, fechaInicio, fechaFin };
    if (onSave) onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg w-full max-w-xl shadow-2xl" style={{ zIndex: 51 }}>
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center text-xl transition-colors cursor-pointer" onClick={onClose} aria-label="Cerrar">×</button>
        <h2 className="text-xl font-semibold text-center pt-5 pb-3 px-5">Abrir Cohorte</h2>

        <div className="bg-gray-50 rounded-lg mx-5 mb-5 p-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Curso</label>
              <select value={curso} onChange={e => setCurso(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer transition-shadow">
                {cursos.length === 0 && <option value="">Seleccionar curso</option>}
                {cursos.map((c) => (
                  <option key={c._id || c} value={c._id || c}>{c.title || c.name || c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Profesor</label>
              <select value={profesor} onChange={e => setProfesor(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer transition-shadow">
                {profesores.length === 0 && <option value="">Seleccionar profesor</option>}
                {profesores.map((p) => (
                  <option key={p._id || p} value={p._id || p}>{p.displayName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || p}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Fecha de inicio</label>
                <div className="relative">
                  <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer transition-shadow" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Fecha de fin</label>
                <div className="relative">
                  <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer transition-shadow" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 flex justify-end gap-3 border-t pt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer">Cancelar</button>
          <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-md text-sm font-semibold shadow-sm hover:shadow transition-all cursor-pointer">Guardar</button>
        </div>
      </div>
    </div>
  );
}

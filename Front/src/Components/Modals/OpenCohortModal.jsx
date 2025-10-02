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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg w-[820px] max-w-[94%] p-6 shadow-lg">
        <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700" onClick={onClose} aria-label="Cerrar">✕</button>
        <h2 className="text-3xl font-medium text-center mb-4">Abrir Cohorte</h2>

        <div className="bg-gray-50 rounded-xl p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Curso</label>
              <select value={curso} onChange={e => setCurso(e.target.value)} className="w-full border rounded-full px-4 py-3 text-sm">
                {cursos.length === 0 && <option value="">Seleccionar curso</option>}
                {cursos.map((c) => (
                  <option key={c._id || c} value={c._id || c}>{c.title || c.name || c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Profesor</label>
              <select value={profesor} onChange={e => setProfesor(e.target.value)} className="w-full border rounded-full px-4 py-3 text-sm">
                {profesores.length === 0 && <option value="">Seleccionar profesor</option>}
                {profesores.map((p) => (
                  <option key={p._id || p} value={p._id || p}>{p.displayName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || p}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Fecha de inicio</label>
                <div className="relative">
                  <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="w-full border rounded-full px-4 py-3 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Fecha de fin</label>
                <div className="relative">
                  <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="w-full border rounded-full px-4 py-3 text-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-4">
          <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full">Guardar</button>
          <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-full">Cancelar</button>
        </div>
      </div>
    </div>
  );
}

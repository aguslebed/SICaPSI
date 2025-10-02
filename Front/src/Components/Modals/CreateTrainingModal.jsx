import React, { useState } from 'react';

export default function CreateTrainingModal({ open, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [levels, setLevels] = useState([{ id: 1, title: 'Nivel 1', classes: [] }]);
  const [selectedLevel, setSelectedLevel] = useState(0);

  if (!open) return null;

  const addLevel = () => {
    const next = { id: Date.now(), title: `Nivel ${levels.length + 1}`, classes: [] };
    setLevels([...levels, next]);
    setSelectedLevel(levels.length);
  };

  const handleSave = () => {
    const payload = { title, subtitle, year, levels };
    if (onSave) onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg w-[90%] max-w-[1100px] shadow-lg overflow-hidden">
        {/* Header green */}
        <div className="bg-green-500 text-white p-6 relative flex items-center gap-4">
          <div className="flex-1">
            <h2 className="text-4xl font-light">{title || 'Capacitación nueva'}</h2>
            <p className="text-sm mt-2">{subtitle || 'Descripción breve'}</p>
            <div className="text-xs mt-1">{year}</div>
          </div>
          <button className="absolute top-3 right-3 text-white/90 bg-white/20 rounded-full w-8 h-8 flex items-center justify-center" onClick={onClose}>✕</button>
        </div>

        {/* Progress bar */}
        <div className="bg-green-700 text-white text-center text-xs py-1">0%</div>

        <div className="p-6">
          {/* Presentation */}
          <details open className="mb-4">
            <summary className="font-semibold cursor-pointer">Presentación de la capacitación</summary>
            <div className="mt-4">
              <label className="block text-sm font-medium">Título</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" />

              <label className="block text-sm font-medium mt-3">Subtítulo / Descripción</label>
              <textarea value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" rows={3} />
            </div>
          </details>

          {/* Levels */}
          <details open className="mb-4">
            <summary className="font-semibold cursor-pointer">Niveles</summary>
            <div className="mt-4">
              <div className="flex items-center gap-4 mb-4">
                <label className="text-sm">Nivel numero</label>
                <select className="border rounded px-3 py-1" value={selectedLevel} onChange={(e) => setSelectedLevel(Number(e.target.value))}>
                  {levels.map((l, idx) => (
                    <option key={l.id} value={idx}>{`Nivel ${idx + 1}`}</option>
                  ))}
                </select>
                <button onClick={addLevel} className="ml-2 bg-green-400 text-white px-3 py-1 rounded">+ Nuevo nivel</button>
              </div>

              {/* Clase / Bibliografía / Preguntas accordion placeholders */}
              <details className="mb-2">
                <summary className="cursor-pointer">Clase</summary>
                <div className="mt-2 p-2 border rounded">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b"><td className="p-2 font-medium w-40">Título</td><td className="p-2">(campo)</td></tr>
                      <tr className="border-b"><td className="p-2 font-medium">Descripción</td><td className="p-2">(campo)</td></tr>
                      <tr className="border-b"><td className="p-2 font-medium">Etiquetas</td><td className="p-2">(campo)</td></tr>
                    </tbody>
                  </table>
                </div>
              </details>

              <details className="mb-2">
                <summary className="cursor-pointer">Bibliografía</summary>
                <div className="mt-2 p-2 border rounded">(gestor de archivos / links)</div>
              </details>

              <details>
                <summary className="cursor-pointer">Preguntas de evaluación</summary>
                <div className="mt-2 p-2 border rounded">(crear preguntas)</div>
              </details>
            </div>
          </details>

          {/* Enroll students */}
          <details className="mb-4">
            <summary className="font-semibold cursor-pointer">Inscribir alumnos</summary>
            <div className="mt-4">(buscar y seleccionar alumnos)</div>
          </details>

          <div className="flex justify-end">
            <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

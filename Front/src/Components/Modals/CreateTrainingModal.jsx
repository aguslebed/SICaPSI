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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh]" style={{ zIndex: 51 }}>
        {/* Header green */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-4 relative flex items-center gap-3 shadow-md">
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{title || 'Capacitación nueva'}</h2>
            <p className="text-xs mt-1.5 opacity-90">{subtitle || 'Descripción breve'}</p>
            <div className="text-xs mt-1 opacity-80">{year}</div>
          </div>
          <button className="absolute top-3 right-3 text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-xl transition-colors cursor-pointer" onClick={onClose}>×</button>
        </div>

        {/* Progress bar */}
        <div className="bg-green-700 text-white text-center text-xs py-1 font-medium">0%</div>

        <div className="p-5 overflow-auto text-sm" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {/* Presentation */}
          <details open className="mb-4 border rounded-lg overflow-hidden">
            <summary className="font-semibold cursor-pointer text-sm bg-gray-50 hover:bg-gray-100 px-3 py-2 transition-colors">Presentación de la capacitación</summary>
            <div className="p-3 space-y-3 bg-white">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Título</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow" placeholder="Ingrese el título de la capacitación" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Subtítulo / Descripción</label>
                <textarea value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow resize-none" rows={3} placeholder="Breve descripción de la capacitación" />
              </div>
            </div>
          </details>

          {/* Levels */}
          <details open className="mb-4 border rounded-lg overflow-hidden">
            <summary className="font-semibold cursor-pointer text-sm bg-gray-50 hover:bg-gray-100 px-3 py-2 transition-colors">Niveles</summary>
            <div className="p-3 bg-white">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <label className="text-xs font-semibold text-gray-700">Nivel número</label>
                <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer" value={selectedLevel} onChange={(e) => setSelectedLevel(Number(e.target.value))}>
                  {levels.map((l, idx) => (
                    <option key={l.id} value={idx}>{`Nivel ${idx + 1}`}</option>
                  ))}
                </select>
                <button onClick={addLevel} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-sm hover:shadow cursor-pointer">+ Nuevo nivel</button>
              </div>

              {/* Clase / Bibliografía / Preguntas accordion placeholders */}
              <div className="space-y-2">
                <details className="border border-gray-200 rounded-md overflow-hidden">
                  <summary className="cursor-pointer text-xs font-medium bg-gray-50 hover:bg-gray-100 px-3 py-2 transition-colors">Clase</summary>
                  <div className="p-3 bg-white">
                    <table className="w-full text-xs">
                      <tbody>
                        <tr className="border-b border-gray-200 last:border-0">
                          <td className="py-2 pr-3 font-semibold text-gray-700 w-32">Título</td>
                          <td className="py-2 text-gray-500">(campo)</td>
                        </tr>
                        <tr className="border-b border-gray-200 last:border-0">
                          <td className="py-2 pr-3 font-semibold text-gray-700">Descripción</td>
                          <td className="py-2 text-gray-500">(campo)</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-3 font-semibold text-gray-700">Etiquetas</td>
                          <td className="py-2 text-gray-500">(campo)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </details>

                <details className="border border-gray-200 rounded-md overflow-hidden">
                  <summary className="cursor-pointer text-xs font-medium bg-gray-50 hover:bg-gray-100 px-3 py-2 transition-colors">Bibliografía</summary>
                  <div className="p-3 bg-white text-xs text-gray-500">(gestor de archivos / links)</div>
                </details>

                <details className="border border-gray-200 rounded-md overflow-hidden">
                  <summary className="cursor-pointer text-xs font-medium bg-gray-50 hover:bg-gray-100 px-3 py-2 transition-colors">Preguntas de evaluación</summary>
                  <div className="p-3 bg-white text-xs text-gray-500">(crear preguntas)</div>
                </details>
              </div>
            </div>
          </details>

          {/* Enroll students */}
          <details className="mb-4 border rounded-lg overflow-hidden">
            <summary className="font-semibold cursor-pointer text-sm bg-gray-50 hover:bg-gray-100 px-3 py-2 transition-colors">Inscribir alumnos</summary>
            <div className="p-3 bg-white text-xs text-gray-500">(buscar y seleccionar alumnos)</div>
          </details>

          <div className="flex justify-end gap-3 pt-2 border-t">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer">Cancelar</button>
            <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-md text-sm font-semibold shadow-sm hover:shadow transition-all cursor-pointer">Guardar Capacitación</button>
          </div>
        </div>
      </div>
    </div>
  );
}

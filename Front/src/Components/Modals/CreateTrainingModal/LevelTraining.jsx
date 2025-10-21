import React from 'react';

export default function LevelTraining({ level, levelIndex, updateLevelField, uploadingFiles, handleFileUpload, handleFileDelete }) {
  return (
    <div className="border border-gray-300 rounded-sm p-2 bg-white">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="bg-gray-500 text-white text-left px-2 py-1.5 text-sm font-semibold border border-gray-400" style={{ width: '25%' }}>
              Campo
            </th>
            <th className="bg-gray-500 text-white text-left px-2 py-1.5 text-sm font-semibold border border-gray-400">
              Ejemplo / Placeholder
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="bg-gray-100 px-2 py-1.5 text-sm font-medium text-gray-700 border border-gray-300">
              Título
            </td>
            <td className="px-2 py-1.5 border border-gray-300">
              <input
                value={level.training.title}
                onChange={(e) => updateLevelField(levelIndex, 'training.title', e.target.value)}
                className="w-full border-0 px-0 py-1 text-sm placeholder:text-sm font-normal focus:ring-0 focus:outline-none bg-transparent"
                placeholder="Control de accesos en eventos"
              />
            </td>
          </tr>
          <tr>
            <td className="bg-gray-100 px-2 py-1.5 text-sm font-medium text-gray-700 border border-gray-300">
              Descripción de la clase
            </td>
            <td className="px-2 py-1.5 border border-gray-300">
              <textarea
                value={level.training.description}
                onChange={(e) => updateLevelField(levelIndex, 'training.description', e.target.value)}
                className="w-full border-0 px-0 py-1 text-sm placeholder:text-sm font-normal focus:ring-0 focus:outline-none bg-transparent resize-none"
                rows={2}
                placeholder="Clase introductoria sobre protocolos de seguridad"
              />
            </td>
          </tr>
          <tr>
            <td className="bg-gray-100 px-2 py-1.5 text-sm font-medium text-gray-700 border border-gray-300">Url/Archivo</td>
            <td className="px-2 py-1.5 border border-gray-300">
              <div>
                <div className="flex items-center gap-3">
                  <input
                    value={level.training.url}
                    onChange={async (e) => {
                      const newValue = e.target.value;
                      const currentValue = level.training.url;

                      if (currentValue && currentValue.startsWith('/uploads/') && currentValue !== newValue) {
                        try {
                          await handleFileDelete(currentValue, levelIndex);
                        } catch (error) {
                          console.error('Error eliminando archivo anterior:', error);
                        }
                      }

                      updateLevelField(levelIndex, 'training.url', newValue);
                    }}
                    className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm placeholder:text-sm font-normal focus:ring-2 focus:ring-green-200 focus:border-transparent"
                    placeholder="URL del video de la clase o deja vacío para subir archivo"
                  />

                  <label className="inline-block">
                    <input
                      type="file"
                      accept=".mp4,.pdf,.ppt,.pptx"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          await handleFileUpload(file, levelIndex);
                        } catch (err) {
                          console.error('Error subiendo archivo:', err);
                        } finally {
                          e.target.value = '';
                        }
                      }}
                      className="hidden"
                      disabled={uploadingFiles && uploadingFiles[`level-${levelIndex}-training`]}
                    />
                    <span className="inline-block px-4 py-2 bg-gray-500 border border-gray-500 rounded-lg text-sm text-white cursor-pointer hover:bg-gray-600">Choose File</span>
                  </label>

                  <div className="flex items-center gap-2">
                    {uploadingFiles && uploadingFiles[`level-${levelIndex}-training`] && <div className="animate-spin h-4 w-4 border-2 border-gray-200 border-t-green-600 rounded-full" />}
                    {level.training.url && (
                      <button
                        type="button"
                        onClick={() => handleFileDelete(level.training.url, levelIndex)}
                        className="text-red-600 hover:text-red-800 text-sm px-2 py-1 border border-red-200 rounded-md cursor-pointer"
                        title="Eliminar archivo/URL"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-1 text-xs text-indigo-600 text-right">Menor a 100 Mb - Formatos: MP4, PDF, PPT</div>
              </div>
            </td>
          </tr>
          <tr>
            <td className="bg-gray-100 px-2 py-1.5 text-sm font-medium text-gray-700 border border-gray-300">
              Duración (min)
            </td>
            <td className="px-2 py-1.5 border border-gray-300">
              <input
                type="number"
                min="0"
                value={level.training.duration}
                onChange={(e) => updateLevelField(levelIndex, 'training.duration', parseInt(e.target.value) || 0)}
                className="w-full border-0 px-0 py-1 text-sm placeholder:text-sm font-normal focus:ring-0 focus:outline-none bg-transparent"
                placeholder="45"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

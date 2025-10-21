import React from 'react';

export default function LevelTraining({ level, levelIndex, updateLevelField, uploadingFiles, handleFileUpload, handleFileDelete, showWarningModal }) {
  return (
    <div className="border border-gray-300 rounded-sm p-1.5 md:p-1.5 lg:p-2 xl:p-2 bg-white">
      <table className="w-full border-collapse text-xs md:text-xs lg:text-xs xl:text-sm">
        <thead>
          <tr>
            <th className="bg-gray-500 text-white text-left px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 text-xs md:text-xs lg:text-xs xl:text-sm font-semibold border border-gray-400" style={{ width: '20%' }}>
              Campo
            </th>
            <th className="bg-gray-500 text-white text-left px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 text-xs md:text-xs lg:text-xs xl:text-sm font-semibold border border-gray-400">
              Datos
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="bg-gray-100 px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 text-xs md:text-xs lg:text-xs xl:text-sm font-medium text-gray-700 border border-gray-300">
              Título
            </td>
            <td className="px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 border border-gray-300">
              <input
                value={level.training.title}
                onChange={(e) => updateLevelField(levelIndex, 'training.title', e.target.value)}
                maxLength={50}
                className="w-full border-0 px-0 py-0.5 md:py-0.5 lg:py-0.5 xl:py-1 text-xs md:text-xs lg:text-xs xl:text-sm placeholder:text-xs md:placeholder:text-xs lg:placeholder:text-xs xl:placeholder:text-sm font-normal focus:ring-0 focus:outline-none bg-transparent"
                placeholder="Ingrese el titulo de la Clase Magistral (Max caracteres: 50)"
              />
              <p className="text-[10px] md:text-[10px] lg:text-[11px] xl:text-xs text-gray-500 mt-0.5 md:mt-0.5 lg:mt-0.5 xl:mt-1 text-right">{level.training.title.length}/50 caracteres</p>
            </td>
          </tr>
          <tr>
            <td className="bg-gray-100 px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 text-xs md:text-xs lg:text-xs xl:text-sm font-medium text-gray-700 border border-gray-300">
              Descripción
            </td>
            <td className="px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 border border-gray-300">
              <textarea
                value={level.training.description}
                onChange={(e) => updateLevelField(levelIndex, 'training.description', e.target.value)}
                maxLength={100}
                className="w-full border-0 px-0 py-0.5 md:py-0.5 lg:py-0.5 xl:py-1 text-xs md:text-xs lg:text-xs xl:text-sm placeholder:text-xs md:placeholder:text-xs lg:placeholder:text-xs xl:placeholder:text-sm font-normal focus:ring-0 focus:outline-none bg-transparent resize-none"
                rows={2}
                placeholder="Ingrese la descripción de la Clase Magistral (Max 100 caracteres)"
              />
              <p className="text-[10px] md:text-[10px] lg:text-[11px] xl:text-xs text-gray-500 mt-0.5 md:mt-0.5 lg:mt-0.5 xl:mt-1 text-right">{level.training.description.length}/100 caracteres</p>
            </td>
          </tr>
          <tr>
            <td className="bg-gray-100 px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 text-xs md:text-xs lg:text-xs xl:text-sm font-medium text-gray-700 border border-gray-300">Url o Archivo</td>
            <td className="px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 border border-gray-300">
              <div>
                <div className="flex items-center gap-1.5 md:gap-1.5 lg:gap-2 xl:gap-2">
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
                    className="flex-1 border border-gray-200 rounded-lg px-2 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 text-xs md:text-xs lg:text-xs xl:text-sm placeholder:text-xs md:placeholder:text-xs lg:placeholder:text-xs xl:placeholder:text-sm font-normal focus:ring-2 focus:ring-green-200 focus:border-transparent"
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
                          const response = await handleFileUpload(file, levelIndex);
                          const filePath = typeof response === 'string' ? response : response?.filePath;
                          if (!filePath) {
                            throw new Error('No se recibió la ruta del archivo');
                          }
                          updateLevelField(levelIndex, 'training.url', filePath);
                        } catch (err) {
                          console.error('Error subiendo archivo:', err);
                          if (showWarningModal) {
                            showWarningModal(`Error subiendo archivo: ${err.message || 'Error desconocido'}`);
                          }
                        } finally {
                          e.target.value = '';
                        }
                      }}
                      className="hidden"
                      disabled={uploadingFiles && uploadingFiles[`level-${levelIndex}-training`]}
                    />
                    <span className="inline-block px-2 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 bg-gray-500 border border-gray-500 rounded-lg text-xs md:text-xs lg:text-xs xl:text-sm text-white cursor-pointer hover:bg-gray-600">Choose File</span>
                  </label>

                  <div className="flex items-center gap-1.5 md:gap-1.5 lg:gap-2 xl:gap-2">
                    {uploadingFiles && uploadingFiles[`level-${levelIndex}-training`] && <div className="animate-spin h-3 w-3 md:h-3 md:w-3 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4 border-2 border-gray-200 border-t-green-600 rounded-full" />}
                    {level.training.url && (
                      <button
                        type="button"
                        onClick={() => handleFileDelete(level.training.url, levelIndex)}
                        className="text-red-600 hover:text-red-800 text-xs md:text-xs lg:text-xs xl:text-sm px-1.5 py-0.5 md:px-1.5 md:py-0.5 lg:px-2 lg:py-0.5 xl:px-2 xl:py-1 border border-red-200 rounded-md cursor-pointer"
                        title="Eliminar archivo/URL"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-0.5 md:mt-0.5 lg:mt-1 xl:mt-1.5 text-[10px] md:text-[10px] lg:text-[11px] xl:text-xs text-indigo-600 text-right">Menor a 100 Mb - Formatos: MP4, PDF, PPT</div>
              </div>
            </td>
          </tr>
          <tr>
            <td className="bg-gray-100 px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 text-xs md:text-xs lg:text-xs xl:text-sm font-medium text-gray-700 border border-gray-300">
              Duración (min)
            </td>
            <td className="px-1.5 py-1 md:px-2 md:py-1 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 border border-gray-300">
              <input
                type="text"
                value={level.training.duration}
                onChange={(e) => {
                  const value = e.target.value;
                  // Solo permite números enteros positivos
                  if (value === '' || /^[0-9]+$/.test(value)) {
                    updateLevelField(levelIndex, 'training.duration', value === '' ? 0 : parseInt(value));
                  }
                }}
                className="w-full border-0 px-0 py-0.5 md:py-0.5 lg:py-0.5 xl:py-1 text-xs md:text-xs lg:text-xs xl:text-sm placeholder:text-xs md:placeholder:text-xs lg:placeholder:text-xs xl:placeholder:text-sm font-normal focus:ring-0 focus:outline-none bg-transparent"
                placeholder="45"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

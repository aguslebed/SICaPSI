import React, { useState } from 'react';

export default function LevelBibliography({ bibliography, updateLevelField, levelIndex, uploadingFiles, handleFileUpload, handleFileDelete, showWarningModal, onTempValuesChange }) {
  const [tempBibTitle, setTempBibTitle] = useState('');
  const [tempBibDescription, setTempBibDescription] = useState('');
  const [tempBibUrl, setTempBibUrl] = useState('');

  // Log para debug de bibliografía recibida
  React.useEffect(() => {
    console.log(`📚 LevelBibliography - Nivel ${levelIndex} bibliografía recibida:`, bibliography);
    console.log(`📚 LevelBibliography - Es array?:`, Array.isArray(bibliography));
    console.log(`📚 LevelBibliography - Cantidad:`, bibliography?.length || 0);
  }, [bibliography, levelIndex]);

  // Notificar cambios al padre
  React.useEffect(() => {
    if (onTempValuesChange) {
      onTempValuesChange({
        title: tempBibTitle,
        description: tempBibDescription,
        url: tempBibUrl
      });
    }
  }, [tempBibTitle, tempBibDescription, tempBibUrl, onTempValuesChange]);

  const addBib = () => {
    if (!tempBibTitle && !tempBibUrl) return;
    const newBibliography = [...(bibliography || [])];
    newBibliography.push({
      title: tempBibTitle,
      description: tempBibDescription,
      url: tempBibUrl
    });
    updateLevelField(newBibliography);
    setTempBibTitle('');
    setTempBibDescription('');
    setTempBibUrl('');
  };

  return (
    <div className="border border-gray-300 rounded-sm p-1.5 bg-white">
      {/* Formulario para agregar nuevo elemento */}
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="bg-gray-500 text-white text-left px-1.5 py-1 text-xs font-semibold border border-gray-400" style={{ width: '25%' }}>
              Campo
            </th>
            <th className="bg-gray-500 text-white text-left px-1.5 py-1 text-xs font-semibold border border-gray-400">
              Datos
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="bg-gray-100 px-1.5 py-1 text-xs font-medium text-gray-700 border border-gray-300" style={{ width: '25%' }}>
              Título
            </td>
            <td className="px-1.5 py-1 border border-gray-300">
              <input
                type="text"
                value={tempBibTitle}
                onChange={(e) => {
                  if (e.target.value.length <= 50) {
                    setTempBibTitle(e.target.value);
                  }
                }}
                placeholder="Ingrese el título de la bibliografía (Max caracteres: 50)"
                maxLength={50}
                className="w-full border-0 px-0 py-0.5 text-xs placeholder:text-xs font-normal focus:ring-0 focus:outline-none bg-transparent"
              />
              <p className="text-[10px] text-gray-500 mt-0.5 text-right">{tempBibTitle.length}/50 caracteres</p>
            </td>
          </tr>
          <tr>
            <td className="bg-gray-100 px-1.5 py-1 text-xs font-medium text-gray-700 border border-gray-300">
              Descripción
            </td>
            <td className="px-1.5 py-1 border border-gray-300">
              <textarea
                value={tempBibDescription}
                onChange={(e) => {
                  if (e.target.value.length <= 100) {
                    setTempBibDescription(e.target.value);
                  }
                }}
                placeholder="Ingrese la descripción de la bibliografía (Max caracteres: 100)"
                maxLength={100}
                rows="2"
                className="w-full border-0 px-0 py-0.5 text-xs placeholder:text-xs font-normal focus:ring-0 focus:outline-none bg-transparent resize-none"
              />
              <p className="text-[10px] text-gray-500 mt-0.5 text-right">{tempBibDescription.length}/100 caracteres</p>
            </td>
          </tr>
          <tr>
            <td className="bg-gray-100 px-1.5 py-1 text-xs font-medium text-gray-700 border border-gray-300">
              Url o Archivo
            </td>
            <td className="px-1.5 py-1 border border-gray-300">
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={tempBibUrl}
                  onChange={(e) => setTempBibUrl(e.target.value)}
                  placeholder="https://ejemplo.com/documento.pdf"
                  className="flex-1 border-0 px-0 py-0.5 text-xs placeholder:text-xs font-normal focus:ring-0 focus:outline-none bg-transparent"
                />
                {tempBibUrl && tempBibUrl.startsWith('/uploads/') && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (tempBibUrl && typeof tempBibUrl === 'string' && tempBibUrl.startsWith('/uploads/')) {
                        try {
                          await handleFileDelete(tempBibUrl, levelIndex);
                        } catch (error) {
                          console.error('Error eliminando archivo:', error);
                        }
                      }
                      setTempBibUrl('');
                    }}
                    className="text-red-600 hover:text-red-800 text-xs px-1.5 py-0.5 border border-red-200 rounded-md cursor-pointer"
                  >
                    ✕
                  </button>
                )}
                <label className="bg-gray-500 border border-gray-500 text-white px-3 py-1.5 rounded-lg text-xs cursor-pointer hover:bg-gray-600">
                  Choose File
                  <input
                    type="file"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      if (file.size > 50 * 1024 * 1024) {
                        if (showWarningModal) {
                          showWarningModal('El archivo es demasiado grande. Máximo 50 MB.');
                        }
                        e.target.value = '';
                        return;
                      }

                      try {
                        // Si ya hay un archivo subido, eliminarlo primero
                        if (tempBibUrl && tempBibUrl.startsWith('/uploads/')) {
                          try {
                            await handleFileDelete(tempBibUrl, levelIndex);
                          } catch (error) {
                            console.error('Error eliminando archivo anterior:', error);
                          }
                        }

                        const response = await handleFileUpload(file, levelIndex);
                        const filePath = typeof response === 'string' ? response : response?.filePath;
                        if (!filePath) {
                          throw new Error('No se recibió la ruta del archivo');
                        }
                        setTempBibUrl(filePath);
                      } catch (error) {
                        console.error('Error subiendo archivo:', error);
                        if (showWarningModal) {
                          showWarningModal(`Error subiendo archivo: ${error.message || 'Error desconocido'}`);
                        }
                      } finally {
                        e.target.value = '';
                      }
                    }}
                  />
                </label>
                {uploadingFiles && uploadingFiles[`level-${levelIndex}-training`] && (
                  <div className="animate-spin h-3 w-3 border-2 border-gray-200 border-t-green-600 rounded-full" />
                )}
              </div>
              <p className="text-[10px] text-indigo-600 mt-0.5 text-right">Menor a 50 Mb - Música, Video o Documento</p>
            </td>
          </tr>
          <tr>
            <td colSpan="2" className="px-1.5 py-1 border border-gray-300 text-right">
              <button
                type="button"
                onClick={addBib}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-green-600 px-3 py-1.5 rounded-sm text-xs font-medium cursor-pointer"
              >
                + Agregar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
